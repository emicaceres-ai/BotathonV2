def calcular_score_riesgo(voluntario_data: dict) -> int:
    """
    Calcula el score de riesgo de baja (0-100).
    
    Lógica de asignación de puntos:
    - Si razon_no_continuar incluye "Falta de Tiempo": +40 puntos
    - Si rango_etario es "18-29 años": +35 puntos
    - Si estado es "Receso" o "Activo sin Asignación": +25 puntos
    - Si fecha_rechazo_count >= 2: +20 puntos
    - Si programa_asignado es NULL o vacío: +15 puntos
    """
    score = 0
    
    razon = str(voluntario_data.get("razon_no_continuar", "")).lower()
    if "falta de tiempo" in razon or "tiempo" in razon:
        score += 40
    
    rango_etario = str(voluntario_data.get("rango_etario", ""))
    if "18-29" in rango_etario:
        score += 35
    
    estado = str(voluntario_data.get("estado", ""))
    if estado in ["Receso", "Sin Asignación"]:
        score += 25
    
    fecha_rechazo_count = int(voluntario_data.get("fecha_rechazo_count", 0))
    if fecha_rechazo_count >= 2:
        score += 20
    
    programa_asignado = voluntario_data.get("programa_asignado")
    if not programa_asignado or programa_asignado.strip() == "":
        score += 15
    
    return min(score, 100)

def calcular_flag_brecha(voluntario_data: dict) -> bool:
    """
    Calcula el flag de brecha de capacitación.
    
    Lógica (Gap Analysis):
    - flag_brecha_cap = TRUE si:
      - area_estudio es 'SALUD' Y tiene_capacitacion es FALSE
    """
    area_estudio = str(voluntario_data.get("area_estudio", "")).upper()
    tiene_capacitacion = bool(voluntario_data.get("tiene_capacitacion", False))
    
    if area_estudio == "SALUD" and not tiene_capacitacion:
        return True
    
    return False

def aplicar_inteligencia_predictiva(voluntario_data: dict) -> dict:
    """
    Aplica ambas funciones de inteligencia predictiva y retorna los resultados.
    """
    score = calcular_score_riesgo(voluntario_data)
    flag_brecha = calcular_flag_brecha(voluntario_data)
    
    voluntario_data["score_riesgo_baja"] = score
    voluntario_data["flag_brecha_cap"] = flag_brecha
    
    return voluntario_data

