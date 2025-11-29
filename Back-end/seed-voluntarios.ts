// Script para poblar la tabla voluntarios con datos sintéticos
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });
config({ path: join(__dirname, '../.env') });
config({ path: join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tatvmyjoinyfkxeclbso.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida en las variables de entorno');
  console.error('   Asegúrate de tener un archivo .env o .env.local con:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Datos para generar registros sintéticos
const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes"
];

const HABILIDADES = [
  "Primeros Auxilios",
  "Logística",
  "Apoyo Digital",
  "Atención al Público",
  "IA",
  "Automatización",
  "Redes Sociales",
  "Contención emocional"
];

const CAMPAÑAS_OPCIONES = [
  ["2021"],
  ["2022"],
  ["2023"],
  ["2024"],
  ["2022", "2023"],
  ["2023", "2024"],
  ["2021", "2022", "2023"],
  ["2022", "2023", "2024"]
];

const NIVELES_EDUCACIONALES = [
  "Media Completa",
  "Universitaria",
  "Técnico Superior",
  "Postgrado"
];

const ESTADOS = ['aprobado', 'pendiente', 'rechazado'] as const;
type Estado = typeof ESTADOS[number];

// Nombres chilenos realistas
const NOMBRES = [
  "Fernanda", "Matías", "Camila", "Sebastián", "Valentina", "Diego", "Javiera", "Nicolás",
  "Constanza", "Felipe", "Catalina", "Andrés", "Francisca", "Ignacio", "Isidora", "Tomás",
  "Antonia", "Benjamín", "Amanda", "Cristóbal", "Trinidad", "Maximiliano", "Emilia", "Rodrigo",
  "Sofía", "Lucas", "Martina", "Gabriel", "Agustina", "Joaquín", "Maite", "Vicente",
  "Florencia", "Alonso", "Amparo", "Rafael", "Magdalena", "Esteban", "Paz", "Simón",
  "Rosario", "Leonardo", "Esperanza", "Eduardo", "Carmen", "Patricio", "Dominga", "Hernán"
];

const APELLIDOS = [
  "Rivas", "Toro", "González", "Muñoz", "Silva", "Morales", "Jara", "Castro",
  "Vargas", "Martínez", "Fernández", "López", "Sánchez", "Ramírez", "Torres", "Flores",
  "Rivera", "Gómez", "Díaz", "Cruz", "Reyes", "Gutiérrez", "Castro", "Ruiz",
  "Jiménez", "Moreno", "Álvarez", "Romero", "Navarro", "Mendoza", "Herrera", "Medina",
  "Aguilar", "Vega", "Guerrero", "Ramos", "Ortega", "Delgado", "Peña", "Méndez"
];

// Función para obtener un elemento aleatorio de un array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para obtener múltiples elementos aleatorios únicos
function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Función para generar un estado según la distribución requerida
function generarEstado(): Estado {
  const rand = Math.random();
  if (rand < 0.6) return 'aprobado';      // 60%
  if (rand < 0.9) return 'pendiente';     // 30%
  return 'rechazado';                     // 10%
}

// Función para generar un correo único
function generarCorreo(nombre: string, apellido: string, index: number): string {
  const nombreLower = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const apellidoLower = apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const dominios = ['gmail.com', 'hotmail.com', 'yahoo.cl', 'outlook.com', 'test.com'];
  const dominio = randomElement(dominios);
  return `${nombreLower}.${apellidoLower}${index}@${dominio}`;
}

// Función para generar un registro sintético
function generarVoluntario(index: number): {
  nombre: string;
  correo: string;
  region: string;
  habilidades: string[];
  campañas: string[];
  nivel_educacional: string;
  estado?: Estado; // Opcional, ya que la columna puede no existir
} {
  const nombre = randomElement(NOMBRES);
  const apellido = randomElement(APELLIDOS);
  const nombreCompleto = `${nombre} ${apellido}`;
  
  const voluntario: {
    nombre: string;
    correo: string;
    region: string;
    habilidades: string[];
    campañas: string[];
    nivel_educacional: string;
    estado?: Estado;
  } = {
    nombre: nombreCompleto,
    correo: generarCorreo(nombre, apellido, index),
    region: randomElement(REGIONES_CHILE),
    habilidades: randomElements(HABILIDADES, Math.floor(Math.random() * 4) + 1), // 1-4 habilidades
    campañas: randomElement(CAMPAÑAS_OPCIONES),
    nivel_educacional: randomElement(NIVELES_EDUCACIONALES)
  };
  
  // Intentar incluir estado, pero si falla, se omitirá
  // La columna puede no existir en la BD
  try {
    voluntario.estado = generarEstado();
  } catch {
    // Si hay error, simplemente no incluir estado
  }
  
  return voluntario;
}

// Función principal
async function seedVoluntarios() {
  console.log('🌱 Iniciando seed de voluntarios...\n');
  
  // Generar entre 40 y 60 registros
  const cantidad = Math.floor(Math.random() * 21) + 40; // 40-60
  console.log(`📊 Generando ${cantidad} registros sintéticos...`);
  
  const voluntarios = [];
  for (let i = 0; i < cantidad; i++) {
    voluntarios.push(generarVoluntario(i));
  }
  
  console.log(`✅ ${cantidad} registros generados`);
  console.log(`\n📝 Ejemplo de registro:`);
  console.log(JSON.stringify(voluntarios[0], null, 2));
  
    // Limpiar registros: remover 'estado' si causa problemas y manejar campañas
  const registrosLimpios = voluntarios.map(v => {
    const registro: Record<string, unknown> = {
      nombre: v.nombre,
      correo: v.correo,
      region: v.region,
      habilidades: v.habilidades,
      nivel_educacional: v.nivel_educacional
    };
    
    // Intentar con diferentes variantes de campañas (como en la función Edge)
    if (v.campañas.length > 0) {
      // Intentar primero sin tilde, luego con tilde
      registro.campanas = v.campañas; // Sin tilde primero
    }
    
    // No incluir estado por ahora (la columna no existe)
    // registro.estado = v.estado;
    
    return registro;
  });
  
  // Insertar en lotes para evitar problemas de tamaño
  const BATCH_SIZE = 20;
  let totalInsertados = 0;
  let totalErrores = 0;
  
  console.log(`\n💾 Insertando registros en lotes de ${BATCH_SIZE}...\n`);
  
  for (let i = 0; i < registrosLimpios.length; i += BATCH_SIZE) {
    const lote = registrosLimpios.slice(i, i + BATCH_SIZE);
    const loteNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalLotes = Math.ceil(registrosLimpios.length / BATCH_SIZE);
    
    console.log(`   Insertando lote ${loteNum}/${totalLotes} (${lote.length} registros)...`);
    
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .insert(lote)
        .select();
      
      if (error) {
        console.error(`   ❌ Error en lote ${loteNum}:`, error.message);
        
        // Si el error es por 'campanas', intentar sin esa columna
        if (error.message?.includes('campanas') || error.message?.includes('campana')) {
          console.log(`   🔄 Reintentando lote ${loteNum} sin campañas...`);
          const loteSinCampanas = lote.map((r: any) => {
            const { campanas, ...resto } = r;
            return resto;
          });
          
          const retry = await supabase
            .from('voluntarios')
            .insert(loteSinCampanas)
            .select();
          
          if (retry.error) {
            console.error(`   ❌ Error en reintento:`, retry.error.message);
            totalErrores += lote.length;
          } else {
            console.log(`   ✅ Lote ${loteNum} insertado sin campañas (${retry.data?.length || 0} registros)`);
            totalInsertados += retry.data?.length || 0;
          }
        } else {
          totalErrores += lote.length;
        }
      } else {
        console.log(`   ✅ Lote ${loteNum} insertado correctamente (${data?.length || 0} registros)`);
        totalInsertados += data?.length || 0;
      }
    } catch (err: any) {
      console.error(`   ❌ Excepción en lote ${loteNum}:`, err.message);
      totalErrores += lote.length;
    }
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL SEED');
  console.log('='.repeat(60));
  console.log(`✅ Registros insertados exitosamente: ${totalInsertados}`);
  if (totalErrores > 0) {
    console.log(`❌ Registros con errores: ${totalErrores}`);
  }
  console.log(`📈 Total procesado: ${voluntarios.length}`);
  
  // Verificar datos insertados
  console.log('\n🔍 Verificando datos en la base de datos...');
  const { data: verificacion, error: errorVerificacion } = await supabase
    .from('voluntarios')
    .select('id', { count: 'exact', head: false });
  
  if (!errorVerificacion) {
    const totalEnBD = verificacion?.length || 0;
    console.log(`📊 Total de registros en la tabla: ${totalEnBD}`);
    
    // Estadísticas por región
    const { data: stats } = await supabase
      .from('voluntarios')
      .select('region');
    
    if (stats) {
      const porRegion = stats.reduce((acc: Record<string, number>, v: any) => {
        acc[v.region || 'sin_region'] = (acc[v.region || 'sin_region'] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Distribución por región (top 5):');
      Object.entries(porRegion)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .forEach(([region, count]) => {
          console.log(`   ${region}: ${count}`);
        });
    }
  } else {
    console.error('❌ Error al verificar datos:', errorVerificacion.message);
  }
  
  console.log('\n✅ Seed completado!\n');
}

// Ejecutar
seedVoluntarios()
  .then(() => {
    console.log('🎉 Proceso finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

