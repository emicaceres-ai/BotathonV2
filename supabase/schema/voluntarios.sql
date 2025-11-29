-- Esquema de Base de Datos para Sistema de Inteligencia Predictiva de Voluntariado - Teletón
-- Compatible con Supabase PostgreSQL y Edge Functions existentes
-- IMPORTANTE: Esta migración es incremental y NO borra datos existentes

-- Verificar que la tabla voluntarios existe (si no existe, crearla primero)
CREATE TABLE IF NOT EXISTS voluntarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    correo VARCHAR(200),
    region VARCHAR(100) NOT NULL,
    habilidades TEXT[],
    campañas TEXT[],
    nivel_educacional VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas nuevas si no existen (migración incremental)
DO $$ 
BEGIN
    -- Agregar estado si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'estado') THEN
        ALTER TABLE voluntarios ADD COLUMN estado VARCHAR(50) DEFAULT 'Activo';
    END IF;

    -- Agregar edad si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'edad') THEN
        ALTER TABLE voluntarios ADD COLUMN edad INTEGER CHECK (edad >= 18);
    END IF;

    -- Agregar rango_etario si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'rango_etario') THEN
        ALTER TABLE voluntarios ADD COLUMN rango_etario VARCHAR(50);
    END IF;

    -- Agregar area_estudio si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'area_estudio') THEN
        ALTER TABLE voluntarios ADD COLUMN area_estudio VARCHAR(100);
    END IF;

    -- Agregar razon_no_continuar si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'razon_no_continuar') THEN
        ALTER TABLE voluntarios ADD COLUMN razon_no_continuar VARCHAR(500);
    END IF;

    -- Agregar tiene_capacitacion si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'tiene_capacitacion') THEN
        ALTER TABLE voluntarios ADD COLUMN tiene_capacitacion BOOLEAN DEFAULT FALSE;
    END IF;

    -- Agregar programa_asignado si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'programa_asignado') THEN
        ALTER TABLE voluntarios ADD COLUMN programa_asignado VARCHAR(100);
    END IF;

    -- Agregar fecha_rechazo_count si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'fecha_rechazo_count') THEN
        ALTER TABLE voluntarios ADD COLUMN fecha_rechazo_count INTEGER DEFAULT 0 CHECK (fecha_rechazo_count >= 0);
    END IF;

    -- Agregar score_riesgo_baja si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'score_riesgo_baja') THEN
        ALTER TABLE voluntarios ADD COLUMN score_riesgo_baja INTEGER DEFAULT 0 CHECK (score_riesgo_baja >= 0 AND score_riesgo_baja <= 100);
    END IF;

    -- Agregar flag_brecha_cap si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'flag_brecha_cap') THEN
        ALTER TABLE voluntarios ADD COLUMN flag_brecha_cap BOOLEAN DEFAULT FALSE;
    END IF;

    -- Agregar updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'voluntarios' AND column_name = 'updated_at') THEN
        ALTER TABLE voluntarios ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_voluntarios_region ON voluntarios(region);

-- Índices condicionales (solo crear si las columnas existen)
DO $$
BEGIN
    -- Índice de estado
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' AND column_name = 'estado') THEN
        CREATE INDEX IF NOT EXISTS idx_voluntarios_estado ON voluntarios(estado);
    END IF;

    -- Índice de score_riesgo_baja
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' AND column_name = 'score_riesgo_baja') THEN
        CREATE INDEX IF NOT EXISTS idx_voluntarios_score_riesgo ON voluntarios(score_riesgo_baja);
    END IF;

    -- Índice de flag_brecha_cap
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' AND column_name = 'flag_brecha_cap') THEN
        CREATE INDEX IF NOT EXISTS idx_voluntarios_flag_brecha ON voluntarios(flag_brecha_cap);
    END IF;

    -- Índice de area_estudio
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' AND column_name = 'area_estudio') THEN
        CREATE INDEX IF NOT EXISTS idx_voluntarios_area_estudio ON voluntarios(area_estudio);
    END IF;

    -- Índice de programa_asignado
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' AND column_name = 'programa_asignado') THEN
        CREATE INDEX IF NOT EXISTS idx_voluntarios_programa_asignado ON voluntarios(programa_asignado);
    END IF;

    -- Índice de rango_etario
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'voluntarios' AND column_name = 'rango_etario') THEN
        CREATE INDEX IF NOT EXISTS idx_voluntarios_rango_etario ON voluntarios(rango_etario);
    END IF;
END $$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_voluntarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at (solo si no existe)
DROP TRIGGER IF EXISTS update_voluntarios_updated_at_trigger ON voluntarios;
CREATE TRIGGER update_voluntarios_updated_at_trigger
    BEFORE UPDATE ON voluntarios
    FOR EACH ROW
    EXECUTE FUNCTION update_voluntarios_updated_at();

-- Comentarios en las columnas
COMMENT ON COLUMN voluntarios.score_riesgo_baja IS 'OUTPUT de la IA - Score de riesgo de baja (0-100)';
COMMENT ON COLUMN voluntarios.flag_brecha_cap IS 'OUTPUT de la IA - Flag de brecha de capacitación';
COMMENT ON COLUMN voluntarios.rango_etario IS 'Rango etario calculado automáticamente basado en edad';
