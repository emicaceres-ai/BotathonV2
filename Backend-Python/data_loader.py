import pandas as pd
import os
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from database import Voluntario
from inteligencia_predictiva import aplicar_inteligencia_predictiva

# Mapeo de columnas comunes a nombres de BD
COLUMN_MAPPING = {
    "nombre": ["nombre", "name", "Nombre", "NOMBRE"],
    "edad": ["edad", "age", "Edad", "EDAD"],
    "rango_etario": ["rango_etario", "rango etario", "Rango Etario", "rango"],
    "region": ["region", "región", "Region", "REGION"],
    "area_estudio": ["area_estudio", "area estudio", "AreaEstudio", "Especialidad", "area", "Area"],
    "estado": ["estado", "Estado", "ESTADO", "status"],
    "razon_no_continuar": ["razon_no_continuar", "razon", "Razon", "motivo"],
    "tiene_capacitacion": ["tiene_capacitacion", "capacitacion", "Capacitacion", "capacitado"],
    "programa_asignado": ["programa_asignado", "programa", "Programa", "programa asignado"],
    "fecha_rechazo_count": ["fecha_rechazo_count", "rechazos", "Rechazos", "rechazo_count"]
}

def normalize_column_name(col_name: str) -> str:
    """Normaliza el nombre de columna a formato estándar."""
    col_lower = str(col_name).strip().lower().replace(" ", "_")
    
    for standard_name, variants in COLUMN_MAPPING.items():
        if col_lower in [v.lower() for v in variants]:
            return standard_name
    
    return col_lower

def load_file(file_path: str) -> pd.DataFrame:
    """Carga un archivo CSV o XLSX y retorna un DataFrame."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Archivo no encontrado: {file_path}")
    
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == ".csv":
        df = pd.read_csv(file_path, encoding="utf-8")
    elif file_ext in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)
    else:
        raise ValueError(f"Formato de archivo no soportado: {file_ext}")
    
    return df

def map_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Mapea las columnas del DataFrame a los nombres estándar de la BD."""
    column_mapping = {}
    
    for col in df.columns:
        standard_name = normalize_column_name(col)
        if standard_name != col:
            column_mapping[col] = standard_name
    
    if column_mapping:
        df = df.rename(columns=column_mapping)
    
    return df

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Limpia y valida los datos del DataFrame."""
    df = df.copy()
    
    if "nombre" not in df.columns:
        raise ValueError("Columna 'nombre' es obligatoria")
    if "edad" not in df.columns:
        raise ValueError("Columna 'edad' es obligatoria")
    if "region" not in df.columns:
        raise ValueError("Columna 'region' es obligatoria")
    
    df = df.dropna(subset=["nombre", "edad", "region"])
    
    df["edad"] = pd.to_numeric(df["edad"], errors="coerce")
    df = df.dropna(subset=["edad"])
    df = df[df["edad"] >= 18]
    
    if "tiene_capacitacion" in df.columns:
        df["tiene_capacitacion"] = df["tiene_capacitacion"].apply(
            lambda x: str(x).lower() in ["true", "1", "si", "sí", "yes", "verdadero"]
        )
    else:
        df["tiene_capacitacion"] = False
    
    if "fecha_rechazo_count" in df.columns:
        df["fecha_rechazo_count"] = pd.to_numeric(df["fecha_rechazo_count"], errors="coerce").fillna(0).astype(int)
    else:
        df["fecha_rechazo_count"] = 0
    
    return df

def upload_data(file_path: str, file_type: str = None, db: Session = None) -> Tuple[int, int, int, List[str]]:
    """
    Función principal para cargar datos desde archivo CSV o XLSX.
    
    Args:
        file_path: Ruta al archivo
        file_type: Tipo de archivo (csv/xlsx) - se detecta automáticamente si es None
        db: Sesión de base de datos
    
    Returns:
        Tuple con (records_processed, records_inserted, records_updated, errors)
    """
    errors = []
    records_inserted = 0
    records_updated = 0
    
    try:
        df = load_file(file_path)
        df = map_columns(df)
        df = clean_data(df)
        
        records_processed = len(df)
        
        for _, row in df.iterrows():
            try:
                voluntario_dict = row.to_dict()
                
                voluntario_dict["rango_etario"] = voluntario_dict.get("rango_etario")
                if not voluntario_dict["rango_etario"]:
                    edad = int(voluntario_dict["edad"])
                    if 18 <= edad <= 29:
                        voluntario_dict["rango_etario"] = "18-29 años"
                    elif 30 <= edad <= 39:
                        voluntario_dict["rango_etario"] = "30-39 años"
                    elif 40 <= edad <= 49:
                        voluntario_dict["rango_etario"] = "40-49 años"
                    elif 50 <= edad <= 59:
                        voluntario_dict["rango_etario"] = "50-59 años"
                    else:
                        voluntario_dict["rango_etario"] = "60+ años"
                
                voluntario_dict = aplicar_inteligencia_predictiva(voluntario_dict)
                
                existing = db.query(Voluntario).filter(
                    Voluntario.nombre == voluntario_dict["nombre"],
                    Voluntario.region == voluntario_dict["region"]
                ).first()
                
                if existing:
                    for key, value in voluntario_dict.items():
                        if key not in ["id", "created_at"]:
                            setattr(existing, key, value)
                    records_updated += 1
                else:
                    nuevo_voluntario = Voluntario(**voluntario_dict)
                    db.add(nuevo_voluntario)
                    records_inserted += 1
                    
            except Exception as e:
                errors.append(f"Error procesando fila {_ + 1}: {str(e)}")
        
        db.commit()
        
    except Exception as e:
        errors.append(f"Error general: {str(e)}")
        db.rollback()
    
    return records_processed, records_inserted, records_updated, errors

