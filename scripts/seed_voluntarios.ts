// Script para poblar la tabla voluntarios con datos sinteticos usando Edge Function /voluntarios
// Este script usa la Edge Function para que la IA se aplique automaticamente
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });
config({ path: join(__dirname, '../.env') });
config({ path: join(__dirname, '../Back-end/.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tatvmyjoinyfkxeclbso.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no esta definida');
  process.exit(1);
}

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/voluntarios`;

// Datos para generar registros sinteticos
const REGIONES_CHILE = [
  "Arica y Parinacota", "Tarapaca", "Antofagasta", "Atacama",
  "Coquimbo", "Valparaiso", "Metropolitana", "O'Higgins",
  "Maule", "Nuble", "Biobio", "Araucania",
  "Los Rios", "Los Lagos", "Aysen", "Magallanes"
];

const HABILIDADES = [
  "Primeros Auxilios", "Logistica", "Apoyo Digital", "Atencion al Publico",
  "IA", "Automatizacion", "Redes Sociales", "Contencion emocional"
];

const CAMPAÑAS_OPCIONES = [
  ["2021"], ["2022"], ["2023"], ["2024"],
  ["2022", "2023"], ["2023", "2024"],
  ["2021", "2022", "2023"], ["2022", "2023", "2024"]
];

const NIVELES_EDUCACIONALES = [
  "Media Completa", "Universitaria", "Tecnico Superior", "Postgrado"
];

const AREAS_ESTUDIO = [
  "SALUD", "EDUCACION", "INGENIERIA", "ADMINISTRACION", "PSICOLOGIA", "DERECHO", "COMUNICACIONES"
];

const RAZONES_NO_CONTINUAR = [
  "Falta de Tiempo", "Cambio de trabajo", "Problemas personales", 
  "No especificada", "Motivos familiares", "Relocalizacion"
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function generarCorreo(nombre: string, apellido: string, index: number): string {
  const nombreLower = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const apellidoLower = apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const dominios = ['gmail.com', 'hotmail.com', 'yahoo.cl', 'outlook.com', 'test.com'];
  const dominio = randomElement(dominios);
  return `${nombreLower}.${apellidoLower}${index}@${dominio}`;
}

function generarVoluntario(index: number): Record<string, unknown> {
  const nombre = randomElement([
    "Fernanda", "Matias", "Camila", "Sebastian", "Valentina", "Diego", "Javiera", "Nicolas",
    "Constanza", "Felipe", "Catalina", "Andres", "Francisca", "Ignacio", "Isidora", "Tomas",
    "Antonia", "Benjamin", "Amanda", "Cristobal", "Trinidad", "Maximiliano", "Emilia", "Rodrigo"
  ]);
  const apellido = randomElement([
    "Rivas", "Toro", "Gonzalez", "Munoz", "Silva", "Morales", "Jara", "Castro",
    "Vargas", "Martinez", "Fernandez", "Lopez", "Sanchez", "Ramirez", "Torres", "Flores"
  ]);
  const nombreCompleto = `${nombre} ${apellido}`;
  
  const edad = Math.floor(Math.random() * 42) + 18; // 18-60
  const tieneCapacitacion = Math.random() < 0.6; // 60% tiene capacitacion
  const areaEstudio = randomElement(AREAS_ESTUDIO);
  const estado = Math.random() < 0.7 ? "Activo" : (Math.random() < 0.5 ? "Receso" : "Sin Asignacion");
  const fechaRechazoCount = Math.random() < 0.3 ? Math.floor(Math.random() * 4) : 0; // 30% tiene rechazos
  const razonNoContinuar = fechaRechazoCount > 0 ? randomElement(RAZONES_NO_CONTINUAR) : "";
  const programaAsignado = Math.random() < 0.7 ? `Programa ${Math.floor(Math.random() * 5) + 1}` : "";

  return {
    nombre: nombreCompleto,
    correo: generarCorreo(nombre, apellido, index),
    region: randomElement(REGIONES_CHILE),
    edad,
    area_estudio: areaEstudio,
    estado,
    razon_no_continuar: razonNoContinuar,
    tiene_capacitacion: tieneCapacitacion,
    programa_asignado: programaAsignado,
    fecha_rechazo_count: fechaRechazoCount,
    habilidades: randomElements(HABILIDADES, Math.floor(Math.random() * 4) + 1),
    campañas: randomElement(CAMPAÑAS_OPCIONES),
    nivel_educacional: randomElement(NIVELES_EDUCACIONALES)
  };
}

async function insertarVoluntario(voluntario: Record<string, unknown>): Promise<boolean> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(voluntario)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error(`   ❌ Error: ${errorData.message || response.statusText}`);
      return false;
    }

    const result = await response.json();
    if (result.success) {
      return true;
    } else {
      console.error(`   ❌ Error: ${result.message || 'Error desconocido'}`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Excepcion:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function seedVoluntarios() {
  console.log('🌱 Iniciando seed de voluntarios con IA integrada...\n');
  
  const cantidad = 50; // Generar 50 registros
  console.log(`📊 Generando ${cantidad} registros sinteticos...`);
  
  const voluntarios = [];
  for (let i = 0; i < cantidad; i++) {
    voluntarios.push(generarVoluntario(i));
  }
  
  console.log(`✅ ${cantidad} registros generados`);
  console.log(`\n📝 Ejemplo de registro:`);
  console.log(JSON.stringify(voluntarios[0], null, 2));
  
  console.log(`\n💾 Insertando registros usando Edge Function /voluntarios...`);
  console.log(`   (La IA se aplicara automaticamente en cada insercion)\n`);
  
  let totalInsertados = 0;
  let totalErrores = 0;
  
  for (let i = 0; i < voluntarios.length; i++) {
    const num = i + 1;
    process.stdout.write(`   [${num}/${cantidad}] Insertando ${voluntarios[i].nombre}... `);
    
    const exito = await insertarVoluntario(voluntarios[i]);
    
    if (exito) {
      totalInsertados++;
      console.log('✅');
    } else {
      totalErrores++;
      console.log('❌');
    }
    
    // Pequeno delay para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL SEED');
  console.log('='.repeat(60));
  console.log(`✅ Registros insertados exitosamente: ${totalInsertados}`);
  if (totalErrores > 0) {
    console.log(`❌ Registros con errores: ${totalErrores}`);
  }
  console.log(`📈 Total procesado: ${voluntarios.length}`);
  console.log(`\n💡 Nota: Todos los registros fueron procesados por la IA predictiva`);
  console.log(`   (score_riesgo_baja y flag_brecha_cap calculados automaticamente)`);
  
  console.log('\n✅ Seed completado!\n');
}

seedVoluntarios()
  .then(() => {
    console.log('🎉 Proceso finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

