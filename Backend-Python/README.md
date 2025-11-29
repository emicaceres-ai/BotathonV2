# Sistema de Inteligencia Predictiva de Voluntariado - Teletón

MVP del sistema de predicción de retención y optimización de talento para voluntarios de Teletón.

## 🏗️ Arquitectura

- **Backend**: Python con FastAPI
- **Base de Datos**: PostgreSQL
- **ORM**: SQLAlchemy
- **Validación**: Pydantic

## 📋 Requisitos

- Python 3.8+
- PostgreSQL 12+
- pip

## 🚀 Instalación

1. **Instalar dependencias:**
   ```bash
   cd Backend-Python
   pip install -r requirements.txt
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de PostgreSQL
   ```

3. **Crear la base de datos:**
   ```bash
   # Conectar a PostgreSQL y ejecutar:
   psql -U postgres -c "CREATE DATABASE teleton_db;"
   psql -U postgres -d teleton_db -f schema.sql
   ```

4. **Iniciar el servidor:**
   ```bash
   python main.py
   # O con uvicorn directamente:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📊 Estructura de la Base de Datos

### Tabla: `voluntarios`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT (PK) | Identificador único |
| `nombre` | VARCHAR | Nombre del voluntario |
| `edad` | INT | Edad (validación >= 18) |
| `rango_etario` | VARCHAR | Rango etario (18-29, 30-39, etc.) |
| `region` | VARCHAR | Región del voluntario |
| `area_estudio` | VARCHAR | Área de estudio (Salud, etc.) |
| `estado` | VARCHAR | Estado (Activo, Receso, Sin Asignación) |
| `razon_no_continuar` | VARCHAR | Razón de no continuar |
| `tiene_capacitacion` | BOOLEAN | Si tiene capacitación |
| `programa_asignado` | VARCHAR | Programa asignado (OTL, Abre, Servicios) |
| `fecha_rechazo_count` | INT | Contador de rechazos (< 3) |
| `score_riesgo_baja` | INT | **OUTPUT IA** - Score de riesgo (0-100) |
| `flag_brecha_cap` | BOOLEAN | **OUTPUT IA** - Flag de brecha de capacitación |

## 🔌 Endpoints API

### 1. Registro de Voluntario
```http
POST /api/voluntarios/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "edad": 25,
  "region": "Metropolitana",
  "area_estudio": "Salud",
  "estado": "Activo",
  "tiene_capacitacion": false
}
```

### 2. Listado de Voluntarios
```http
GET /api/voluntarios/?skip=0&limit=100
```

### 3. Búsqueda con Filtros
```http
GET /api/voluntarios/search?min_score_riesgo=75&region=Metropolitana&brecha_pendiente=true
```

O con POST:
```http
POST /api/voluntarios/search
Content-Type: application/json

{
  "min_score_riesgo": 75,
  "region": "Metropolitana",
  "brecha_pendiente": true
}
```

### 4. RPA - Acción Urgente
```http
GET /api/rpa/accion_urgente
```
Retorna voluntarios con `score_riesgo_baja > 75` O `flag_brecha_cap = TRUE`

### 5. Carga Masiva de Datos
```http
POST /api/voluntarios/upload
Content-Type: multipart/form-data

file: [archivo.csv o .xlsx]
```

## 🧠 Lógica de Inteligencia Predictiva

### Score de Riesgo de Baja (0-100)

- **+40 puntos**: Si `razon_no_continuar` incluye "Falta de Tiempo"
- **+35 puntos**: Si `rango_etario` es "18-29 años"
- **+25 puntos**: Si `estado` es "Receso" o "Sin Asignación"
- **+20 puntos**: Si `fecha_rechazo_count >= 2`
- **+15 puntos**: Si `programa_asignado` es NULL o vacío

### Flag de Brecha de Capacitación

- **TRUE**: Si `area_estudio = 'SALUD'` Y `tiene_capacitacion = FALSE`
- **FALSE**: En cualquier otro caso

## 📁 Estructura del Proyecto

```
Backend-Python/
├── main.py                 # Aplicación FastAPI principal
├── database.py             # Configuración de BD y modelos SQLAlchemy
├── models.py               # Modelos Pydantic para validación
├── inteligencia_predictiva.py  # Lógica de scoring y gap analysis
├── data_loader.py          # Módulo de carga de datos (CSV/XLSX)
├── schema.sql              # Esquema SQL de la base de datos
├── requirements.txt        # Dependencias Python
├── .env.example            # Ejemplo de variables de entorno
└── README.md               # Este archivo
```

## 🔄 Módulo de Carga de Datos

El módulo `data_loader.py` soporta:

- **Formatos**: CSV y XLSX
- **Mapeo automático**: Detecta columnas con nombres variados
- **Validación**: Valida edad >= 18, campos obligatorios
- **Consolidación**: Inserta o actualiza registros existentes
- **Cálculo automático**: Aplica scoring y gap analysis

### Ejemplo de uso:

```python
from data_loader import upload_data
from database import SessionLocal

db = SessionLocal()
records_processed, inserted, updated, errors = upload_data("datos.csv", db=db)
```

## 🧪 Testing

```bash
# Ejecutar servidor
uvicorn main:app --reload

# Probar endpoints
curl http://localhost:8000/api/voluntarios/
```

## 📝 Notas

- Los scores se calculan automáticamente al crear o actualizar voluntarios
- El mapeo de columnas es flexible y soporta variaciones de nombres
- La carga masiva valida y limpia los datos antes de insertar
- Los endpoints están listos para integración con RPA

