import pymysql

from dotenv import load_dotenv
import os

load_dotenv()  # Carga variables de .env

DB_CONNECTION = {
    "DB_HOST": os.getenv("DB_HOST"),
    "DB_USER": os.getenv("DB_USER"),
    "DB_PASSWORD": os.getenv("DB_PASSWORD"),
    "DB_NAME": os.getenv("DB_NAME"),
    "DB_PORT": int(os.getenv("DB_PORT", 3306)),

}

# ----------------------------------------------------
#  BLOQUE DE IMPRESIÓN SOLICITADO
# ----------------------------------------------------
print("--- VARIABLES DE CONEXIÓN CARGADAS ---")
print(f"HOST: {DB_CONNECTION['DB_HOST']}")
print(f"USER: {DB_CONNECTION['DB_USER']}")
print(f"DB_PORT: {DB_CONNECTION['DB_PORT']}")
print(f"DB_NAME: {DB_CONNECTION['DB_NAME']}")
print(f"DB_PASSWORD: {DB_CONNECTION['DB_PASSWORD']}")
print("--------------------------------------")
# ----------------------------------------------------


def get_db_connection():
    return pymysql.connect(
        host=DB_CONNECTION["DB_HOST"],
        port=DB_CONNECTION["DB_PORT"],
        user=DB_CONNECTION["DB_USER"],
        password=DB_CONNECTION["DB_PASSWORD"],
        database=DB_CONNECTION["DB_NAME"],
        cursorclass=pymysql.cursors.DictCursor
    )
