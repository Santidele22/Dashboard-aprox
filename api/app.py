from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from dotenv import load_dotenv
import os

load_dotenv()  # Carga variables de .env

app = Flask(__name__)
CORS(app)

# Configuración de MySQL usando variables de entorno con valores por defecto
DB_CONNECTION = {
    "DB_HOST": os.getenv("DB_HOST", "localhost"),
    "DB_USER": os.getenv("DB_USER", "root"),
    "DB_PASSWORD": os.getenv("DB_PASSWORD", ""),
    "DB_NAME": os.getenv("DB_NAME", "")
}


def get_db_connection():
    return pymysql.connect(
        host=DB_CONNECTION["DB_HOST"],
        user=DB_CONNECTION["DB_USER"],
        password=DB_CONNECTION["DB_PASSWORD"],
        database=DB_CONNECTION["DB_NAME"],
        cursorclass=pymysql.cursors.DictCursor
    )

# --------------------
# Endpoints
# --------------------


@app.route('/api/movimiento', methods=['POST'])
def registrar_movimiento():
    try:
        data = request.get_json()
        descripcion = data.get('descripcion', 'Movimiento detectado')

        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                query = "INSERT INTO movimientos (descripcion, fecha_hora) VALUES (%s, NOW())"
                cursor.execute(query, (descripcion,))
            connection.commit()
            movimiento_id = cursor.lastrowid

        return jsonify({
            'success': True,
            'message': 'Movimiento registrado correctamente',
            'id': movimiento_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al registrar movimiento: {str(e)}'
        }), 500


@app.route('/api/movimientos', methods=['GET'])
def obtener_movimientos():
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        offset = (page - 1) * limit

        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, descripcion, fecha_hora FROM movimientos "
                    "ORDER BY fecha_hora DESC LIMIT %s OFFSET %s", (
                        limit, offset)
                )
                movimientos = cursor.fetchall()

                cursor.execute("SELECT COUNT(*) as total FROM movimientos")
                total = cursor.fetchone()['total']

        return jsonify({
            'success': True,
            'data': movimientos,
            'pagination': {
                'total': total,
                'page': page,
                'limit': limit,
                'total_pages': (total + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener movimientos: {str(e)}'
        }), 500


@app.route('/api/movimiento/<int:id>', methods=['GET'])
def obtener_movimiento(id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, descripcion, fecha_hora FROM movimientos WHERE id = %s", (
                        id,)
                )
                movimiento = cursor.fetchone()

        if movimiento:
            return jsonify({'success': True, 'data': movimiento}), 200
        else:
            return jsonify({'success': False, 'message': 'Movimiento no encontrado'}), 404

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al obtener movimiento: {str(e)}'}), 500


@app.route('/api/estadisticas', methods=['GET'])
def obtener_estadisticas():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as total FROM movimientos")
                total = cursor.fetchone()['total']

                cursor.execute(
                    "SELECT COUNT(*) as hoy FROM movimientos WHERE DATE(fecha_hora) = CURDATE()")
                hoy = cursor.fetchone()['hoy']

                cursor.execute(
                    "SELECT COUNT(*) as semana FROM movimientos WHERE YEARWEEK(fecha_hora, 1) = YEARWEEK(CURDATE(), 1)")
                semana = cursor.fetchone()['semana']

                cursor.execute(
                    "SELECT fecha_hora FROM movimientos ORDER BY fecha_hora DESC LIMIT 1")
                ultimo = cursor.fetchone()

        return jsonify({
            'success': True,
            'data': {
                'total': total,
                'hoy': hoy,
                'semana': semana,
                'ultimo_movimiento': ultimo['fecha_hora'] if ultimo else None
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al obtener estadísticas: {str(e)}'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        with get_db_connection():
            pass  # Solo probamos la conexión
        return jsonify({'success': True, 'message': 'API y base de datos funcionando correctamente'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error de conexión: {str(e)}'}), 500


# --------------------
# Run app
# --------------------
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
