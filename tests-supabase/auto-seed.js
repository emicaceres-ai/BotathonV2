#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

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

// Datos para generar registros sintéticos
const REGIONES = [
  "Metropolitana", "Valparaíso", "Biobío", "Araucanía", "Los Lagos",
  "Maule", "O'Higgins", "Coquimbo", "Antofagasta", "Tarapacá"
];

const HABILIDADES = [
  "Primeros Auxilios", "Logística", "Apoyo Digital", "Atención al Público",
  "IA", "Automatización", "Redes Sociales", "Contención emocional"
];

const AREAS_ESTUDIO = [
  "SALUD", "EDUCACION", "INGENIERIA", "ADMINISTRACION", "PSICOLOGIA"
];

const ESTADOS = ["Activo", "Receso", "Sin Asignación"];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function generarVoluntario(index) {
  const nombres = ["Juan", "María", "Pedro", "Ana", "Carlos", "Laura", "Diego", "Sofía"];
  const apellidos = ["González", "Rodríguez", "Martínez", "López", "García", "Pérez", "Sánchez", "Ramírez"];
  
  const nombre = `${randomElement(nombres)} ${randomElement(apellidos)}`;
  const edad = Math.floor(Math.random() * 42) + 18; // 18-60
  const tieneCapacitacion = Math.random() < 0.6;
  const areaEstudio = randomElement(AREAS_ESTUDIO);
  const estado = randomElement(ESTADOS);
  const fechaRechazoCount = Math.random() < 0.3 ? Math.floor(Math.random() * 4) : 0;
  const razonNoContinuar = fechaRechazoCount > 0 ? "Falta de Tiempo" : "";
  const programaAsignado = Math.random() < 0.7 ? `Programa ${Math.floor(Math.random() * 5) + 1}` : "";

  return {
    nombre: `${nombre} ${index}`,
    correo: `test-seed-${Date.now()}-${index}@test.com`,
    region: randomElement(REGIONES),
    edad,
    area_estudio: areaEstudio,
    estado,
    razon_no_continuar: razonNoContinuar,
    tiene_capacitacion: tieneCapacitacion,
    programa_asignado: programaAsignado,
    fecha_rechazo_count: fechaRechazoCount,
    habilidades: randomElements(HABILIDADES, Math.floor(Math.random() * 4) + 1),
    campañas: [String(2020 + Math.floor(Math.random() * 5))],
    nivel_educacional: randomElement(["Media Completa", "Universitaria", "Técnico Superior", "Postgrado"])
  };
}

async function insertarVoluntario(voluntario) {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/voluntarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(voluntario)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || response.statusText);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al insertar');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

async function seedVoluntarios() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 CARGA AUTOMÁTICA DE DATOS SINTÉTICOS');
  console.log('='.repeat(60) + '\n');

  const cantidad = 20;
  console.log(`📊 Generando ${cantidad} voluntarios sintéticos...\n`);

  const voluntarios = [];
  for (let i = 0; i < cantidad; i++) {
    voluntarios.push(generarVoluntario(i));
  }

  let insertados = 0;
  let errores = 0;

  for (let i = 0; i < voluntarios.length; i++) {
    const num = i + 1;
    process.stdout.write(`   [${num}/${cantidad}] Insertando ${voluntarios[i].nombre}... `);

    try {
      const resultado = await insertarVoluntario(voluntarios[i]);
      
      // Validar que IA se aplicó
      if (typeof resultado.score_riesgo_baja !== 'number') {
        throw new Error('IA no aplicada: score_riesgo_baja faltante');
      }
      if (typeof resultado.flag_brecha_cap !== 'boolean') {
        throw new Error('IA no aplicada: flag_brecha_cap faltante');
      }

      insertados++;
      console.log(`✅ (score: ${resultado.score_riesgo_baja}, flag: ${resultado.flag_brecha_cap})`);
      
      // Pequeño delay para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      errores++;
      console.log(`❌ ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL SEED');
  console.log('='.repeat(60));
  console.log(`✅ Insertados exitosamente: ${insertados}`);
  if (errores > 0) {
    console.log(`❌ Errores: ${errores}`);
  }
  console.log(`📈 Total procesado: ${voluntarios.length}`);

  if (insertados > 0) {
    console.log('\n✅ Seed completado! Los datos están listos para pruebas.');
    console.log('🚀 Ejecutando pruebas automáticas...\n');
    
    // Ejecutar run-tests.js automáticamente
    const testScript = join(__dirname, 'run-tests.js');
    const child = spawn('node', [testScript], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      process.exit(code);
    });
  } else {
    console.log('\n❌ No se insertaron datos. Revisa los errores arriba.');
    process.exit(1);
  }
}

seedVoluntarios().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

