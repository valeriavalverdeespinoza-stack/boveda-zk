from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DATABASE = "database.db"


def crear_db():

    conexion = sqlite3.connect(DATABASE)

    conexion.execute("""
    CREATE TABLE IF NOT EXISTS credenciales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_boveda TEXT,
        servicio TEXT,
        usuario_cifrado TEXT,
        password_cifrado TEXT
    )
    """)

    conexion.commit()
    conexion.close()


@app.route("/")
def inicio():

    return jsonify({
        "mensaje": "Servidor funcionando"
    })


@app.route("/guardar", methods=["POST"])
def guardar():

    datos = request.get_json()
    conexion = sqlite3.connect(DATABASE)
    conexion.execute("""
    INSERT INTO credenciales
    (
        usuario_boveda,
        servicio,
        usuario_cifrado,
        password_cifrado
    )
    VALUES (?, ?, ?, ?)
    """, (

        datos["usuario_boveda"],
        datos["servicio"],
        datos["usuario_cifrado"],
        datos["password_cifrado"]

    ))

    conexion.commit()
    conexion.close()

    return jsonify({
        "ok": True
    })


@app.route("/credenciales/<usuario>")
def obtener(usuario):

    conexion = sqlite3.connect(DATABASE)
    cursor = conexion.cursor()
    cursor.execute("""
    SELECT
        servicio,
        usuario_cifrado,
        password_cifrado
    FROM credenciales
    WHERE usuario_boveda = ?
    """, (usuario,))

    filas = cursor.fetchall()
    conexion.close()
    resultado = []

    for fila in filas:

        resultado.append({
            "servicio": fila[0],
            "usuario_cifrado": fila[1],
            "password_cifrado": fila[2]
        })

    return jsonify({
        "credenciales": resultado
    })


if __name__ == "__main__":

    crear_db()
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )