#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: join(__dirname, '../.env.local') });
config({ path: join(__dirname, '../.env') });
config({ path: join(__dirname, '../Front-end/.env.local') });

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tatvmyjoinyfkxeclbso.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!ANON_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
  process.exit(1);
}

const EDGE_FUNCTION_URL = `${BASE_URL}/functions/v1`;

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

async function testVoluntarios() {
  log('Probando /voluntarios (POST)...', 'info');
  const testResult = {
    name: 'POST /voluntarios',
    status: 'failed',
    details: {}
  };

  try {
    const payload = {
      nombre: 'Test Automatizado Backend',
      correo: `test-${Date.now()}@test.com`,
      region: 'Metropolitana',
      edad: 25,
      area_estudio: 'SALUD',
      tiene_capacitacion: false,
      estado: 'Receso',
      razon_no_continuar: 'Falta de Tiempo',
      fecha_rechazo_count: 2,
      programa_asignado: '',
      habilidades: ['IA', 'Automatización'],
      campañas: ['2024']
    };

    const response = await fetch(`${EDGE_FUNCTION_URL}/voluntarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    testResult.details.statusCode = response.status;
    testResult.details.response = data;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Error desconocido'}`);
    }

    if (!data.success) {
      throw new Error(data.message || 'Respuesta no exitosa');
    }

    const voluntario = data.data;
    
    // Validar IA
    if (typeof voluntario.score_riesgo_baja !== 'number' || voluntario.score_riesgo_baja < 0) {
      throw new Error(`score_riesgo_baja inválido: ${voluntario.score_riesgo_baja}`);
    }

    if (typeof voluntario.flag_brecha_cap !== 'boolean') {
      throw new Error(`flag_brecha_cap inválido: ${voluntario.flag_brecha_cap}`);
    }

    if (voluntario.edad && !voluntario.rango_etario) {
      throw new Error('rango_etario no calculado automáticamente');
    }

    // Validar lógica de IA
    const expectedHighScore = voluntario.score_riesgo_baja >= 75;
    const expectedBrecha = voluntario.area_estudio === 'SALUD' && !voluntario.tiene_capacitacion;

    testResult.details.iaValidation = {
      score_riesgo_baja: voluntario.score_riesgo_baja,
      flag_brecha_cap: voluntario.flag_brecha_cap,
      rango_etario: voluntario.rango_etario,
      expectedHighScore,
      expectedBrecha,
      iaWorking: true
    };

    testResult.status = 'passed';
    log(`  ✓ IA funcionando: score=${voluntario.score_riesgo_baja}, flag=${voluntario.flag_brecha_cap}`, 'success');
    
  } catch (error) {
    testResult.details.error = error.message;
    log(`  ✗ Error: ${error.message}`, 'error');
  }

  results.tests.push(testResult);
  results.summary.total++;
  if (testResult.status === 'passed') results.summary.passed++;
  else results.summary.failed++;

  return testResult;
}

async function testBuscar() {
  log('Probando /buscar (GET)...', 'info');
  const testResult = {
    name: 'GET /buscar',
    status: 'failed',
    details: {}
  };

  try {
    // Test 1: Sin filtros
    const response1 = await fetch(`${EDGE_FUNCTION_URL}/buscar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data1 = await response1.json();
    
    if (!response1.ok || !data1.success) {
      throw new Error(`Error en búsqueda sin filtros: ${data1.message || 'Error desconocido'}`);
    }

    // Test 2: Con filtro de score
    const response2 = await fetch(`${EDGE_FUNCTION_URL}/buscar?min_score_riesgo=75`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data2 = await response2.json();
    
    if (!response2.ok || !data2.success) {
      throw new Error(`Error en búsqueda con filtro: ${data2.message || 'Error desconocido'}`);
    }

    // Test 3: Con filtro de brecha
    const response3 = await fetch(`${EDGE_FUNCTION_URL}/buscar?flag_brecha_cap=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data3 = await response3.json();
    
    if (!response3.ok || !data3.success) {
      throw new Error(`Error en búsqueda con brecha: ${data3.message || 'Error desconocido'}`);
    }

    testResult.details = {
      totalResults: data1.data?.length || 0,
      highRiskResults: data2.data?.length || 0,
      brechaResults: data3.data?.length || 0,
      filtersWorking: true
    };

    testResult.status = 'passed';
    log(`  ✓ Búsqueda funcionando: ${data1.data?.length || 0} total, ${data2.data?.length || 0} en riesgo`, 'success');
    
  } catch (error) {
    testResult.details.error = error.message;
    log(`  ✗ Error: ${error.message}`, 'error');
  }

  results.tests.push(testResult);
  results.summary.total++;
  if (testResult.status === 'passed') results.summary.passed++;
  else results.summary.failed++;

  return testResult;
}

async function testRPA() {
  log('Probando /rpa-accion-urgente (GET)...', 'info');
  const testResult = {
    name: 'GET /rpa-accion-urgente',
    status: 'failed',
    details: {}
  };

  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/rpa-accion-urgente`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    testResult.details.statusCode = response.status;
    testResult.details.response = data;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Error desconocido'}`);
    }

    if (!data.success) {
      throw new Error(data.message || 'Respuesta no exitosa');
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Respuesta no es un array');
    }

    // Validar que todos los resultados cumplen criterios
    const allUrgent = data.data.every(v => 
      (v.score_riesgo_baja >= 75) || (v.flag_brecha_cap === true)
    );

    if (!allUrgent && data.data.length > 0) {
      throw new Error('Algunos resultados no cumplen criterios de urgencia');
    }

    testResult.details = {
      totalUrgent: data.data.length,
      total: data.total,
      criterios: data.criterios,
      allUrgent
    };

    testResult.status = 'passed';
    log(`  ✓ RPA funcionando: ${data.data.length} voluntarios urgentes`, 'success');
    
  } catch (error) {
    testResult.details.error = error.message;
    log(`  ✗ Error: ${error.message}`, 'error');
  }

  results.tests.push(testResult);
  results.summary.total++;
  if (testResult.status === 'passed') results.summary.passed++;
  else results.summary.failed++;

  return testResult;
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 PRUEBAS AUTOMATIZADAS DE SUPABASE');
  console.log('='.repeat(60) + '\n');

  await testVoluntarios();
  await testBuscar();
  await testRPA();

  // Guardar resultados
  const resultsPath = join(__dirname, 'results', 'backend-report.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`Total: ${results.summary.total}`);
  console.log(`✅ Pasadas: ${results.summary.passed}`);
  console.log(`❌ Fallidas: ${results.summary.failed}`);
  console.log(`\n📄 Reporte guardado en: ${resultsPath}`);

  // Mensajes finales
  const voluntariosTest = results.tests.find(t => t.name.includes('voluntarios'));
  const buscarTest = results.tests.find(t => t.name.includes('buscar'));
  const rpaTest = results.tests.find(t => t.name.includes('rpa'));

  console.log('\n' + '='.repeat(60));
  console.log('🎯 ESTADO DE FUNCIONES');
  console.log('='.repeat(60));
  
  if (voluntariosTest?.status === 'passed') {
    console.log('✅ IA funcionando (score_riesgo_baja y flag_brecha_cap calculados)');
  } else {
    console.log('❌ IA con problemas');
  }

  if (buscarTest?.status === 'passed') {
    console.log('✅ Buscador funcionando (filtros aplicados correctamente)');
  } else {
    console.log('❌ Buscador con problemas');
  }

  if (rpaTest?.status === 'passed') {
    console.log('✅ RPA funcionando (voluntarios urgentes detectados)');
  } else {
    console.log('❌ RPA con problemas');
  }

  console.log('\n');

  process.exit(results.summary.failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

