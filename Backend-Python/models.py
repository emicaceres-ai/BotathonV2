from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime

class VoluntarioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=200)
    edad: int = Field(..., ge=18, le=100)
    rango_etario: Optional[str] = None
    region: str = Field(..., min_length=1)
    area_estudio: Optional[str] = None
    estado: str = Field(default="Activo")
    razon_no_continuar: Optional[str] = None
    tiene_capacitacion: bool = Field(default=False)
    programa_asignado: Optional[str] = None
    fecha_rechazo_count: int = Field(default=0, ge=0)

    @model_validator(mode='after')
    def set_rango_etario(self):
        if not self.rango_etario:
            if 18 <= self.edad <= 29:
                self.rango_etario = "18-29 años"
            elif 30 <= self.edad <= 39:
                self.rango_etario = "30-39 años"
            elif 40 <= self.edad <= 49:
                self.rango_etario = "40-49 años"
            elif 50 <= self.edad <= 59:
                self.rango_etario = "50-59 años"
            else:
                self.rango_etario = "60+ años"
        return self

    @field_validator('estado')
    @classmethod
    def validate_estado(cls, v):
        allowed = ["Activo", "Receso", "Sin Asignación", "Inactivo"]
        if v not in allowed:
            raise ValueError(f"Estado debe ser uno de: {', '.join(allowed)}")
        return v

class VoluntarioCreate(VoluntarioBase):
    pass

class VoluntarioResponse(VoluntarioBase):
    id: int
    score_riesgo_baja: int
    flag_brecha_cap: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VoluntarioSearch(BaseModel):
    min_score_riesgo: Optional[int] = Field(None, ge=0, le=100)
    region: Optional[str] = None
    area_estudio: Optional[str] = None
    brecha_pendiente: Optional[bool] = None
    estado: Optional[str] = None
    programa_asignado: Optional[str] = None

class FileUploadResponse(BaseModel):
    message: str
    records_processed: int
    records_inserted: int
    records_updated: int
    errors: list = []

