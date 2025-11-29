from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db, init_db, Voluntario
from models import (
    VoluntarioCreate, 
    VoluntarioResponse, 
    VoluntarioSearch,
    FileUploadResponse
)
from inteligencia_predictiva import aplicar_inteligencia_predictiva
from data_loader import upload_data
import os
from dotenv import load_dotenv
import tempfile

load_dotenv()

app = FastAPI(
    title="Sistema de Inteligencia Predictiva de Voluntariado - Teletón",
    description="MVP del sistema de predicción de retención y optimización de talento",
    version="1.0.0"
)

# CORS Configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar BD al arrancar
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {
        "message": "Sistema de Inteligencia Predictiva de Voluntariado - Teletón",
        "version": "1.0.0",
        "endpoints": {
            "registro": "/api/voluntarios/registro",
            "listado": "/api/voluntarios/",
            "busqueda": "/api/voluntarios/search",
            "rpa_accion_urgente": "/api/rpa/accion_urgente"
        }
    }

@app.post("/api/voluntarios/registro", response_model=VoluntarioResponse)
async def registrar_voluntario(
    voluntario: VoluntarioCreate,
    db: Session = Depends(get_db)
):
    """
    RF-01: Registro de un nuevo voluntario.
    Calcula automáticamente score_riesgo_baja y flag_brecha_cap.
    """
    try:
        voluntario_dict = voluntario.dict()
        voluntario_dict = aplicar_inteligencia_predictiva(voluntario_dict)
        
        nuevo_voluntario = Voluntario(**voluntario_dict)
        db.add(nuevo_voluntario)
        db.commit()
        db.refresh(nuevo_voluntario)
        
        return nuevo_voluntario
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al registrar voluntario: {str(e)}")

@app.get("/api/voluntarios/", response_model=List[VoluntarioResponse])
async def listar_voluntarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Retorna la lista completa de voluntarios, incluyendo score_riesgo_baja y flag_brecha_cap.
    """
    voluntarios = db.query(Voluntario).offset(skip).limit(limit).all()
    return voluntarios

@app.get("/api/voluntarios/search", response_model=List[VoluntarioResponse])
@app.post("/api/voluntarios/search", response_model=List[VoluntarioResponse])
async def buscar_voluntarios(
    search: Optional[VoluntarioSearch] = None,
    min_score_riesgo: Optional[int] = Query(None, ge=0, le=100),
    region: Optional[str] = Query(None),
    area_estudio: Optional[str] = Query(None),
    brecha_pendiente: Optional[bool] = Query(None),
    estado: Optional[str] = Query(None),
    programa_asignado: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    RF-03.2: Motor de Búsqueda con filtros.
    Acepta parámetros como min_score_riesgo, region, area_estudio, brecha_pendiente.
    """
    query = db.query(Voluntario)
    
    if search:
        if search.min_score_riesgo is not None:
            query = query.filter(Voluntario.score_riesgo_baja >= search.min_score_riesgo)
        if search.region:
            query = query.filter(Voluntario.region.ilike(f"%{search.region}%"))
        if search.area_estudio:
            query = query.filter(Voluntario.area_estudio.ilike(f"%{search.area_estudio}%"))
        if search.brecha_pendiente is not None:
            query = query.filter(Voluntario.flag_brecha_cap == search.brecha_pendiente)
        if search.estado:
            query = query.filter(Voluntario.estado == search.estado)
        if search.programa_asignado:
            query = query.filter(Voluntario.programa_asignado.ilike(f"%{search.programa_asignado}%"))
    else:
        if min_score_riesgo is not None:
            query = query.filter(Voluntario.score_riesgo_baja >= min_score_riesgo)
        if region:
            query = query.filter(Voluntario.region.ilike(f"%{region}%"))
        if area_estudio:
            query = query.filter(Voluntario.area_estudio.ilike(f"%{area_estudio}%"))
        if brecha_pendiente is not None:
            query = query.filter(Voluntario.flag_brecha_cap == brecha_pendiente)
        if estado:
            query = query.filter(Voluntario.estado == estado)
        if programa_asignado:
            query = query.filter(Voluntario.programa_asignado.ilike(f"%{programa_asignado}%"))
    
    voluntarios = query.all()
    return voluntarios

@app.get("/api/rpa/accion_urgente", response_model=List[dict])
async def rpa_accion_urgente(db: Session = Depends(get_db)):
    """
    RF-04: Retorna lista de IDs de voluntarios que cumplen condiciones de activación RPA.
    Condiciones: score_riesgo_baja > 75 O flag_brecha_cap = TRUE
    """
    voluntarios = db.query(Voluntario).filter(
        (Voluntario.score_riesgo_baja > 75) | (Voluntario.flag_brecha_cap == True)
    ).all()
    
    return [
        {
            "id": v.id,
            "nombre": v.nombre,
            "region": v.region,
            "score_riesgo_baja": v.score_riesgo_baja,
            "flag_brecha_cap": v.flag_brecha_cap,
            "estado": v.estado,
            "programa_asignado": v.programa_asignado
        }
        for v in voluntarios
    ]

@app.post("/api/voluntarios/upload", response_model=FileUploadResponse)
async def upload_data_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    RF-01: Carga masiva de datos desde archivo CSV o XLSX.
    """
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(
            status_code=400,
            detail="Formato de archivo no soportado. Use CSV o XLSX."
        )
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        records_processed, records_inserted, records_updated, errors = upload_data(
            tmp_path, 
            file_type=file_ext,
            db=db
        )
        
        return FileUploadResponse(
            message="Carga completada",
            records_processed=records_processed,
            records_inserted=records_inserted,
            records_updated=records_updated,
            errors=errors
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar archivo: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@app.get("/api/voluntarios/{voluntario_id}", response_model=VoluntarioResponse)
async def obtener_voluntario(voluntario_id: int, db: Session = Depends(get_db)):
    """Obtiene un voluntario por ID."""
    voluntario = db.query(Voluntario).filter(Voluntario.id == voluntario_id).first()
    if not voluntario:
        raise HTTPException(status_code=404, detail="Voluntario no encontrado")
    return voluntario

@app.put("/api/voluntarios/{voluntario_id}", response_model=VoluntarioResponse)
async def actualizar_voluntario(
    voluntario_id: int,
    voluntario: VoluntarioCreate,
    db: Session = Depends(get_db)
):
    """Actualiza un voluntario existente y recalcula scores."""
    db_voluntario = db.query(Voluntario).filter(Voluntario.id == voluntario_id).first()
    if not db_voluntario:
        raise HTTPException(status_code=404, detail="Voluntario no encontrado")
    
    voluntario_dict = voluntario.dict()
    voluntario_dict = aplicar_inteligencia_predictiva(voluntario_dict)
    
    for key, value in voluntario_dict.items():
        setattr(db_voluntario, key, value)
    
    db.commit()
    db.refresh(db_voluntario)
    return db_voluntario

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)

