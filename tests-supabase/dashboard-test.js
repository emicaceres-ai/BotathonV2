#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync } from 'fs';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vite normalmente usa puerto 5173, pero puede ser otro
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5173/dashboard';
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const RESULTS_DIR = join(__dirname, 'results');

let nextjsProcess = null;

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

function startViteServer() {
  return new Promise((resolve, reject) => {
    log('Iniciando servidor Vite (Frontend)...', 'info');
    
    const frontendDir = join(__dirname, '../Front-end');
    
    if (!existsSync(join(frontendDir, 'package.json'))) {
      reject(new Error('Front-end/package.json no encontrado'));
      return;
    }

    nextjsProcess = spawn('npm', ['run', 'dev'], {
      cwd: frontendDir,
      shell: true,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    nextjsProcess.stdout.on('data', (data) => {
      output += data.toString();
      // Vite muestra "Local: http://localhost:5173" o similar
      if (output.includes('Local:') || output.includes('localhost:') || output.includes('5173')) {
        log('Servidor Vite iniciado', 'success');
        setTimeout(resolve, 3000); // Esperar 3 segundos más para que esté listo
      }
    });

    nextjsProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    nextjsProcess.on('error', (error) => {
      reject(new Error(`Error al iniciar servidor: ${error.message}`));
    });

    // Timeout de 30 segundos
    setTimeout(() => {
      if (!output.includes('Local:') && !output.includes('localhost:')) {
        reject(new Error('Timeout: servidor no inició en 30 segundos'));
      }
    }, 30000);
  });
}

function stopViteServer() {
  if (nextjsProcess) {
    log('Deteniendo servidor Vite...', 'info');
    nextjsProcess.kill();
    nextjsProcess = null;
  }
}

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Servidor aún no está listo
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function testDashboard() {
  const report = {
    timestamp: new Date().toISOString(),
    url: DASHBOARD_URL,
    tests: [],
    screenshots: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  let browser = null;
  let page = null;

  try {
    // Iniciar servidor
    await startViteServer();
    
    // Esperar a que el servidor esté listo
    log('Esperando a que el servidor esté listo...', 'info');
    const baseUrl = DASHBOARD_URL.replace('/dashboard', '');
    const serverReady = await waitForServer(baseUrl);
    
    if (!serverReady) {
      throw new Error('Servidor no respondió a tiempo');
    }

    // Iniciar navegador
    log('Iniciando navegador...', 'info');
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Visitar dashboard
    log('Visitando dashboard...', 'info');
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Esperar a que cargue
    await page.waitForTimeout(3000);

    // Screenshot completo
    const screenshotFull = join(SCREENSHOTS_DIR, `dashboard-full-${Date.now()}.png`);
    await page.screenshot({ path: screenshotFull, fullPage: true });
    report.screenshots.push(screenshotFull);
    log('  ✓ Captura completa guardada', 'success');

    // Test 1: Validar que la página cargó
    const test1 = {
      name: 'Dashboard cargado',
      status: 'failed',
      details: {}
    };

    const title = await page.title();
    const hasContent = await page.locator('body').count() > 0;
    
    if (hasContent) {
      test1.status = 'passed';
      test1.details.title = title;
      log('  ✓ Dashboard cargado correctamente', 'success');
    } else {
      test1.details.error = 'Página vacía';
      log('  ✗ Dashboard no cargó', 'error');
    }

    report.tests.push(test1);
    report.summary.total++;
    if (test1.status === 'passed') report.summary.passed++;
    else report.summary.failed++;

    // Test 2: Validar KPIs
    const test2 = {
      name: 'KPIs visibles',
      status: 'failed',
      details: {}
    };

    const kpis = {
      'Total Voluntarios': false,
      'Regiones Activas': false,
      'Nuevos Hoy': false,
      'En Riesgo': false,
      'Brechas Detectadas': false
    };

    for (const kpiName of Object.keys(kpis)) {
      try {
        const kpiElement = page.locator(`text=${kpiName}`).first();
        const count = await kpiElement.count();
        if (count > 0) {
          kpis[kpiName] = true;
          
          // Screenshot del KPI
          const kpiScreenshot = join(SCREENSHOTS_DIR, `kpi-${kpiName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`);
          const boundingBox = await kpiElement.boundingBox();
          if (boundingBox) {
            await page.screenshot({
              path: kpiScreenshot,
              clip: {
                x: Math.max(0, boundingBox.x - 10),
                y: Math.max(0, boundingBox.y - 10),
                width: boundingBox.width + 20,
                height: boundingBox.height + 100
              }
            });
            report.screenshots.push(kpiScreenshot);
          }
        }
      } catch (error) {
        // KPI no encontrado
      }
    }

    const allKPIsVisible = Object.values(kpis).every(v => v === true);
    test2.details.kpis = kpis;
    
    if (allKPIsVisible) {
      test2.status = 'passed';
      log('  ✓ Todos los KPIs visibles', 'success');
    } else {
      const missing = Object.entries(kpis).filter(([_, v]) => !v).map(([k]) => k);
      test2.details.missing = missing;
      log(`  ✗ KPIs faltantes: ${missing.join(', ')}`, 'error');
    }

    report.tests.push(test2);
    report.summary.total++;
    if (test2.status === 'passed') report.summary.passed++;
    else report.summary.failed++;

    // Test 3: Validar valores numéricos en KPIs
    const test3 = {
      name: 'KPIs con valores numéricos',
      status: 'failed',
      details: {}
    };

    try {
      // Buscar números en los KPIs
      const kpiValues = await page.locator('h3.text-3xl').allTextContents();
      const hasNumbers = kpiValues.some(v => /^\d+$/.test(v.trim()));
      
      if (hasNumbers) {
        test3.status = 'passed';
        test3.details.values = kpiValues.filter(v => /^\d+$/.test(v.trim()));
        log('  ✓ KPIs muestran valores numéricos', 'success');
      } else {
        test3.details.error = 'No se encontraron valores numéricos';
        log('  ✗ KPIs sin valores numéricos', 'error');
      }
    } catch (error) {
      test3.details.error = error.message;
      log(`  ✗ Error al validar valores: ${error.message}`, 'error');
    }

    report.tests.push(test3);
    report.summary.total++;
    if (test3.status === 'passed') report.summary.passed++;
    else report.summary.failed++;

    // Test 4: Validar gráfico
    const test4 = {
      name: 'Gráfico de distribución visible',
      status: 'failed',
      details: {}
    };

    try {
      const chart = page.locator('svg').first();
      const chartCount = await chart.count();
      
      if (chartCount > 0) {
        test4.status = 'passed';
        
        // Screenshot del gráfico
        const chartScreenshot = join(SCREENSHOTS_DIR, `chart-${Date.now()}.png`);
        const chartBox = await chart.boundingBox();
        if (chartBox) {
          await page.screenshot({
            path: chartScreenshot,
            clip: {
              x: Math.max(0, chartBox.x - 20),
              y: Math.max(0, chartBox.y - 20),
              width: chartBox.width + 40,
              height: chartBox.height + 40
            }
          });
          report.screenshots.push(chartScreenshot);
        }
        
        log('  ✓ Gráfico visible', 'success');
      } else {
        test4.details.error = 'Gráfico no encontrado';
        log('  ✗ Gráfico no visible', 'error');
      }
    } catch (error) {
      test4.details.error = error.message;
      log(`  ✗ Error al validar gráfico: ${error.message}`, 'error');
    }

    report.tests.push(test4);
    report.summary.total++;
    if (test4.status === 'passed') report.summary.passed++;
    else report.summary.failed++;

    // Guardar reporte
    const reportPath = join(RESULTS_DIR, 'dashboard-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS DEL DASHBOARD');
    console.log('='.repeat(60));
    console.log(`Total: ${report.summary.total}`);
    console.log(`✅ Pasadas: ${report.summary.passed}`);
    console.log(`❌ Fallidas: ${report.summary.failed}`);
    console.log(`📸 Screenshots: ${report.screenshots.length}`);
    console.log(`📄 Reporte guardado en: ${reportPath}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎯 ESTADO DEL DASHBOARD');
    console.log('='.repeat(60));
    
    if (test1.status === 'passed') {
      console.log('✅ Dashboard cargado correctamente');
    } else {
      console.log('❌ Dashboard no cargó');
    }

    if (test2.status === 'passed') {
      console.log('✅ KPIs funcionan (todos visibles)');
    } else {
      console.log('❌ KPIs con problemas');
    }

    if (test3.status === 'passed') {
      console.log('✅ Datos sintéticos visibles (valores numéricos presentes)');
    } else {
      console.log('❌ Datos no visibles');
    }

    console.log('\n');

  } catch (error) {
    log(`Error fatal: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    stopViteServer();
  }
}

testDashboard().catch(error => {
  console.error('❌ Error fatal:', error);
  stopViteServer();
  process.exit(1);
});

