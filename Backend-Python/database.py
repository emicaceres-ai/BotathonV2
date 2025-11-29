from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/teleton_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Voluntario(Base):
    __tablename__ = "voluntarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    edad = Column(Integer, nullable=False)
    rango_etario = Column(String, nullable=True)
    region = Column(String, nullable=False)
    area_estudio = Column(String, nullable=True)
    estado = Column(String, nullable=False, default="Activo")
    razon_no_continuar = Column(String, nullable=True)
    tiene_capacitacion = Column(Boolean, default=False)
    programa_asignado = Column(String, nullable=True)
    fecha_rechazo_count = Column(Integer, default=0)
    score_riesgo_baja = Column(Integer, default=0)
    flag_brecha_cap = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

