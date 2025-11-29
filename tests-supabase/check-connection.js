#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: join(__dirname, '../.env.local') });
config({ path: join(__dirname, '../.env') });
config({ path: join(__dirname, '../Front-end/.env.local') });

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tatvmyjoinyfkxeclbso.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const baseUrl = BASE_URL.endsWith('/functions/v1') 
  ? BASE_URL.replace('/functions/v1', '')
  : BASE_URL;

const EDGE_FUNCTION_URL = `${baseUrl}/functions/v1`;

console.log('\n' + '='.repeat(60));
console.log('🔍 DIAGNÓSTICO DE CONEXIÓN');
console.log('='.repeat(60) + '\n');

console.log(`📡 BASE_URL: ${baseUrl}`);
console.log(`📡 EDGE_FUNCTION_URL: ${EDGE_FUNCTION_URL}`);
console.log(`🔑 ANON_KEY: ${ANON_KEY ? `${ANON_KEY.substring(0, 20)}...` : '❌ NO CONFIGURADA'}\n`);

if (!ANON_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
  console.error('   Crea un archivo .env.local en la raíz con:');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui');
  process.exit(1);
}

async function testConnection() {
  console.log('🧪 Probando conexión a Edge Functions...\n');

  // Test 1: Verificar que la URL base responde
  try {
    console.log(`1️⃣  Probando: ${baseUrl}...`);
    const baseResponse = await fetch(baseUrl, { method: 'HEAD' });
    console.log(`   ✅ Base URL responde (${baseResponse.status})\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Probar /buscar (más simple)
  try {
    console.log(`2️⃣  Probando: ${EDGE_FUNCTION_URL}/buscar...`);
    const buscarResponse = await fetch(`${EDGE_FUNCTION_URL}/buscar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const buscarData = await buscarResponse.json();
    
    if (buscarResponse.ok && buscarData.success) {
      console.log(`   ✅ /buscar funciona (${buscarData.data?.length || 0} resultados)\n`);
    } else {
      console.log(`   ❌ /buscar error: ${buscarData.message || buscarResponse.statusText}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    if (error.cause) {
      console.log(`   🔍 Detalle: ${error.cause.message || error.cause}\n`);
    } else {
      console.log(`   🔍 Verifica que la Edge Function esté desplegada en Supabase\n`);
    }
  }

  // Test 3: Probar /voluntarios con datos mínimos
  try {
    console.log(`3️⃣  Probando: ${EDGE_FUNCTION_URL}/voluntarios...`);
    const voluntariosResponse = await fetch(`${EDGE_FUNCTION_URL}/voluntarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: 'Test Conexión',
        correo: `test-${Date.now()}@test.com`,
        region: 'Metropolitana'
      })
    });

    const voluntariosData = await voluntariosResponse.json();
    
    if (voluntariosResponse.ok && voluntariosData.success) {
      console.log(`   ✅ /voluntarios funciona`);
      console.log(`   ✅ IA aplicada: score=${voluntariosData.data?.score_riesgo_baja || 'N/A'}, flag=${voluntariosData.data?.flag_brecha_cap || 'N/A'}\n`);
    } else {
      console.log(`   ❌ /voluntarios error: ${voluntariosData.message || voluntariosResponse.statusText}`);
      if (voluntariosData.details) {
        console.log(`   🔍 Detalles: ${voluntariosData.details}\n`);
      } else {
        console.log();
      }
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    if (error.cause) {
      console.log(`   🔍 Detalle: ${error.cause.message || error.cause}\n`);
    } else {
      console.log(`   🔍 Verifica que la Edge Function esté desplegada en Supabase\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('💡 Si hay errores, verifica:');
  console.log('   1. Que las Edge Functions estén desplegadas en Supabase');
  console.log('   2. Que NEXT_PUBLIC_SUPABASE_ANON_KEY sea correcta');
  console.log('   3. Que la URL sea correcta');
  console.log('   4. Que no haya problemas de red/firewall');
  console.log('='.repeat(60) + '\n');
}

testConnection().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

