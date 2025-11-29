#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootEnvPath = join(__dirname, '../.env.local');
const frontendEnvPath = join(__dirname, '../Front-end/.env.local');
const correctUrl = 'https://tatvmyjoinyfkxeclbso.supabase.co';
const wrongUrl = 'tatvmvjoinyfkxeclbso';

console.log('\n' + '='.repeat(60));
console.log('🔧 CORRECTOR DE VARIABLES DE ENTORNO');
console.log('='.repeat(60) + '\n');

// Corregir Front-end/.env.local primero (prioridad)
if (existsSync(frontendEnvPath)) {
  console.log('📄 Corrigiendo Front-end/.env.local...');
  let content = readFileSync(frontendEnvPath, 'utf-8');
  let modified = false;
  
  if (content.includes(wrongUrl)) {
    console.log(`❌ URL incorrecta detectada: ${wrongUrl}`);
    content = content.replace(new RegExp(wrongUrl, 'g'), 'tatvmyjoinyfkxeclbso');
    modified = true;
    console.log(`✅ URL corregida a: tatvmyjoinyfkxeclbso`);
  }
  
  if (modified) {
    writeFileSync(frontendEnvPath, content);
    console.log('✅ Front-end/.env.local actualizado\n');
  } else {
    console.log('✅ Front-end/.env.local ya tiene la URL correcta\n');
  }
}

// Corregir .env.local en raíz
if (!existsSync(rootEnvPath)) {
  console.log('⚠️  Archivo .env.local no existe');
  console.log('📝 Creando .env.local con URL correcta...\n');
  
  const content = `# Variables de entorno para BotathonV2
# URL CORRECTA (tatvmyjoinyfkxeclbso)
NEXT_PUBLIC_SUPABASE_URL=${correctUrl}

# Anon Key de Supabase (completa con tu key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=
`;
  
  writeFileSync(rootEnvPath, content);
  console.log('✅ Archivo .env.local creado');
  console.log('⚠️  IMPORTANTE: Completa NEXT_PUBLIC_SUPABASE_ANON_KEY con tu key\n');
} else {
  console.log('📄 Archivo .env.local encontrado');
  let content = readFileSync(rootEnvPath, 'utf-8');
  let modified = false;
  
  // Buscar y corregir URL incorrecta
  if (content.includes(wrongUrl)) {
    console.log(`❌ URL incorrecta detectada: ${wrongUrl}`);
    content = content.replace(new RegExp(wrongUrl, 'g'), 'tatvmyjoinyfkxeclbso');
    modified = true;
    console.log(`✅ URL corregida a: tatvmyjoinyfkxeclbso`);
  }
  
  // Asegurar que la URL correcta esté presente
  if (!content.includes(correctUrl)) {
    console.log('⚠️  URL correcta no encontrada');
    if (content.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
      content = content.replace(
        /NEXT_PUBLIC_SUPABASE_URL=.*/g,
        `NEXT_PUBLIC_SUPABASE_URL=${correctUrl}`
      );
    } else {
      content += `\nNEXT_PUBLIC_SUPABASE_URL=${correctUrl}\n`;
    }
    modified = true;
    console.log(`✅ URL correcta agregada`);
  }
  
  if (modified) {
    writeFileSync(rootEnvPath, content);
    console.log('\n✅ Archivo .env.local actualizado');
  } else {
    console.log('✅ Archivo .env.local ya tiene la URL correcta');
  }
}

console.log('\n' + '='.repeat(60));
console.log('📋 Verificación:');
console.log('='.repeat(60));

// Verificar Front-end/.env.local primero
if (existsSync(frontendEnvPath)) {
  try {
    const content = readFileSync(frontendEnvPath, 'utf-8');
    const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    
    if (urlMatch) {
      const url = urlMatch[1].trim();
      if (url.includes('tatvmyjoinyfkxeclbso')) {
        console.log(`✅ Front-end/.env.local - URL correcta: ${url}`);
      } else {
        console.log(`❌ Front-end/.env.local - URL incorrecta: ${url}`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Error al leer Front-end/.env.local: ${error.message}`);
  }
}

// Verificar .env.local en raíz
if (existsSync(rootEnvPath)) {
  try {
    const content = readFileSync(rootEnvPath, 'utf-8');
  const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch) {
    const url = urlMatch[1].trim();
    if (url.includes('tatvmyjoinyfkxeclbso')) {
      console.log(`✅ URL correcta: ${url}`);
    } else {
      console.log(`❌ URL incorrecta: ${url}`);
      console.log(`   Debe ser: ${correctUrl}`);
    }
  } else {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL no encontrada');
  }
  
  if (keyMatch && keyMatch[1].trim()) {
    console.log(`✅ ANON_KEY configurada: ${keyMatch[1].trim().substring(0, 20)}...`);
  } else {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada o vacía');
    console.log('   Completa el valor en .env.local');
  }
  } catch (error) {
    console.log(`⚠️  Error al leer .env.local: ${error.message}`);
  }
} else {
  console.log('ℹ️  .env.local en raíz no existe (usando Front-end/.env.local)');
}

console.log('\n');

