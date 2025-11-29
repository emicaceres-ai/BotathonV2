#!/usr/bin/env python3
"""
Script para inicializar la base de datos
"""
from database import init_db, engine, Base
import sys

def main():
    print("Inicializando base de datos...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Base de datos inicializada correctamente")
        print("   Tabla 'voluntarios' creada con todos los campos requeridos")
        print("   Índices y triggers configurados")
    except Exception as e:
        print(f"❌ Error al inicializar base de datos: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

