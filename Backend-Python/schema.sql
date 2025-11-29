-- Esquema de Base de Datos para Sistema de Inteligencia Predictiva de Voluntariado - Teletón
-- PostgreSQL

CREATE TABLE IF NOT EXISTS voluntarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    edad INTEGER NOT NULL CHECK (edad >= 18),
    rango_etario VARCHAR(50),
    region VARCHAR(100) NOT NULL,
    area_estudio VARCHAR(100),
    estado VARCHAR(50) NOT NULL DEFAULT 'Activo',
    razon_no_continuar VARCHAR(500),
    tiene_capacitacion BOOLEAN DEFAULT FALSE,
    programa_asignado VARCHAR(100),
    fecha_rechazo_count INTEGER DEFAULT 0 CHECK (fecha_rechazo_count >= 0),
    score_riesgo_baja INTEGER DEFAULT 0 CHECK (score_riesgo_baja >= 0 AND score_riesgo_baja <= 100),
    flag_brecha_cap BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_voluntarios_region ON voluntarios(region);
CREATE INDEX IF NOT EXISTS idx_voluntarios_estado ON voluntarios(estado);
CREATE INDEX IF NOT EXISTS idx_voluntarios_score_riesgo ON voluntarios(score_riesgo_baja);
CREATE INDEX IF NOT EXISTS idx_voluntarios_flag_brecha ON voluntarios(flag_brecha_cap);
CREATE INDEX IF NOT EXISTS idx_voluntarios_area_estudio ON voluntarios(area_estudio);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_voluntarios_updated_at 
    BEFORE UPDATE ON voluntarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en las columnas
COMMENT ON TABLE voluntarios IS 'Tabla principal de voluntarios con outputs de IA';
COMMENT ON COLUMN voluntarios.score_riesgo_baja IS 'OUTPUT de la IA - Score de riesgo de baja (0-100)';
COMMENT ON COLUMN voluntarios.flag_brecha_cap IS 'OUTPUT de la IA - Flag de brecha de capacitación';

