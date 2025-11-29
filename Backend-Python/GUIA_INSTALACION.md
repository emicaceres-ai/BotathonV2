# 🚀 Guía de Instalación y Configuración

## 📋 Requisitos Previos

- Python 3.8 o superior
- PostgreSQL 12 o superior
- pip (gestor de paquetes de Python)

## 🔧 Instalación Paso a Paso

### 1. Instalar Dependencias Python

```bash
cd Backend-Python
pip install -r requirements.txt
```

### 2. Configurar Base de Datos PostgreSQL

#### Opción A: Crear BD manualmente
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE teleton_db;

# Salir de psql
\q

# Ejecutar esquema
psql -U postgres -d teleton_db -f schema.sql
```

#### Opción B: Usar script Python
```bash
# Configurar .env primero (ver paso 3)
python init_db.py
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `Backend-Python/`:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/teleton_db
HOST=0.0.0.0
PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Reemplaza:**
- `usuario`: Tu usuario de PostgreSQL
- `password`: Tu contraseña de PostgreSQL
- `localhost:5432`: Host y puerto de tu PostgreSQL

### 4. Inicializar Base de Datos

```bash
python init_db.py
```

Esto creará la tabla `voluntarios` con todos los campos requeridos.

### 5. Iniciar el Servidor

```bash
python run.py
```

O directamente con uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: `http://localhost:8000`

### 6. Verificar que Funciona

Abre en tu navegador:
- `http://localhost:8000` - Documentación de la API
- `http://localhost:8000/docs` - Swagger UI interactivo

## 🧪 Probar los Endpoints

Usa el archivo `test_endpoints.http` o prueba con curl:

```bash
# Registrar un voluntario
curl -X POST http://localhost:8000/api/voluntarios/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "edad": 25,
    "region": "Metropolitana",
    "area_estudio": "Salud",
    "tiene_capacitacion": false
  }'

# Listar voluntarios
curl http://localhost:8000/api/voluntarios/

# Buscar con filtros
curl "http://localhost:8000/api/voluntarios/search?min_score_riesgo=75"

# RPA - Acción urgente
curl http://localhost:8000/api/rpa/accion_urgente
```

## 📤 Cargar Datos desde Archivo

```bash
curl -X POST http://localhost:8000/api/voluntarios/upload \
  -F "file=@ejemplo_datos.csv"
```

## ⚠️ Solución de Problemas

### Error: "No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### Error: "could not connect to server"
- Verifica que PostgreSQL esté corriendo
- Verifica la URL en `.env`
- Verifica usuario y contraseña

### Error: "relation 'voluntarios' does not exist"
```bash
python init_db.py
# O ejecuta schema.sql manualmente
```

## 📚 Documentación de la API

Una vez que el servidor esté corriendo, visita:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

