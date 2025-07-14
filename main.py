import os
import time
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# ✅ Configuración de conexión a base de datos en Docker
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'database'),  # Cambiado de 127.0.0.1 a 'db' (nombre del servicio en docker-compose)
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'lkqaz923'),
    'database': os.getenv('DB_NAME', 'anki'),
    'port': int(os.getenv('DB_PORT', '3306')),  # Puerto interno del contenedor MariaDB
}

def wait_for_db(max_retries=10, delay=2):
    for i in range(max_retries):
        try:
            conn = mysql.connector.connect(**DB_CONFIG)
            conn.close()
            return
        except mysql.connector.Error as e:
            print(f"[Esperando DB] Reintento {i+1}/{max_retries} - Error: {e}")
            time.sleep(delay)
    raise RuntimeError("No se pudo conectar a la base de datos después de varios intentos.")



# ✅ Crear la instancia FastAPI y las tablas
app = FastAPI()
wait_for_db()


# ✅ Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Modelos
class WordIn(BaseModel):
    english: str
    spanish: str
    category_id: Optional[int]
    
class WordOut(WordIn):
    id: int
    progress: str

class Category(BaseModel):
    id: int
    name: str

# ✅ Endpoint de prueba
@app.get("/ping")
def ping():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.ping(reconnect=True, attempts=1, delay=0)
        conn.close()
        return {"message": "API 2 funcionando correctamente y conexión a la base de datos exitosa."}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión a la base de datos: {str(e)}")

# ✅ Obtener categorías
@app.get("/categories", response_model=List[Category])
def get_categories():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM categories ORDER BY name")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"id": r[0], "name": r[1]} for r in rows]

# ✅ Obtener todas las palabras
@app.get("/words", response_model=List[WordOut])
def get_words():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT id, english, spanish, category_id, progress FROM words ORDER BY id")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [
        {"id": r[0], "english": r[1], "spanish": r[2], "category_id": r[3], "progress": r[4]}
        for r in rows
    ]

# ✅ Agregar palabra
@app.post("/words", response_model=WordOut)
def add_word(word: WordIn):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO words (english, spanish, category_id) VALUES (%s, %s, %s)",
        (word.english, word.spanish, word.category_id)
    )
    conn.commit()
    word_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {**word.dict(), "id": word_id, "progress": "malo"}

# ✅ Editar palabra
@app.put("/words/{word_id}", response_model=WordOut)
def update_word(word_id: int, word: WordIn):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE words SET english=%s, spanish=%s, category_id=%s WHERE id=%s",
        (word.english, word.spanish, word.category_id, word_id)
    )
    conn.commit()
    cursor.execute("SELECT progress FROM words WHERE id=%s", (word_id,))
    progress = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return {**word.dict(), "id": word_id, "progress": progress}

# ✅ Actualizar progreso
@app.put("/words/{word_id}/progress", response_model=WordOut)
def update_progress(word_id: int, progress: str):
    if progress not in ["malo", "regular", "bueno"]:
        raise HTTPException(status_code=400, detail="Valor de progreso inválido")
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("UPDATE words SET progress=%s WHERE id=%s", (progress, word_id))
    conn.commit()
    cursor.execute("SELECT english, spanish, category_id FROM words WHERE id=%s", (word_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Palabra no encontrada")
    cursor.close()
    conn.close()
    return {
        "id": word_id,
        "english": row[0],
        "spanish": row[1],
        "category_id": row[2],
        "progress": progress,
    }

@app.delete("/words/{word_id}", response_model=dict)
def delete_word(word_id: int):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM words WHERE id = %s", (word_id,))
    word = cursor.fetchone()

    if not word:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Palabra no encontrada")

    cursor.execute("DELETE FROM words WHERE id = %s", (word_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Palabra eliminada exitosamente"}