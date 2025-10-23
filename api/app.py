from flask import Flask, request, jsonify
from flask_cors import CORS
from db.dbConnection import get_db_connection

app = Flask(__name__)
CORS(app)


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
    # Helper function to safely fetch the count result (returns 0 if result is None)
    def safe_fetch_count(cursor, key):
        result = cursor.fetchone()
        # Si el resultado es válido (no None) y contiene la clave, devuelve el valor.
        # Si es None o no tiene la clave, devuelve 0.
        return result[key] if result and key in result else 0

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                # 1. TOTAL DE MOVIMIENTOS
                cursor.execute("SELECT COUNT(*) as total FROM movimientos")
                total = safe_fetch_count(cursor, 'total')

                # 2. MOVIMIENTOS HOY
                cursor.execute(
                    "SELECT COUNT(*) as hoy FROM movimientos WHERE DATE(fecha_hora) = CURDATE()")
                hoy = safe_fetch_count(cursor, 'hoy')

                # 3. MOVIMIENTOS ESTA SEMANA
                cursor.execute(
                    "SELECT COUNT(*) as semana FROM movimientos WHERE YEARWEEK(fecha_hora, 1) = YEARWEEK(CURDATE(), 1)")
                semana = safe_fetch_count(cursor, 'semana')

                # 4. ÚLTIMO MOVIMIENTO (Manejo especial, ya que puede ser una fecha)
                cursor.execute(
                    "SELECT fecha_hora FROM movimientos ORDER BY fecha_hora DESC LIMIT 1")
                ultimo = cursor.fetchone()

        # Estructurar la respuesta
        return jsonify({
            'success': True,
            'data': {
                'total': total,
                'hoy': hoy,
                'semana': semana,
                # Usa 'fecha_hora' si 'ultimo' no es None, si no, usa None.
                'ultimo_movimiento': ultimo['fecha_hora'] if ultimo else None
            }
        }), 200

    except Exception as e:
        # En caso de que falle la conexión a la DB, asegúrate de devolver JSON y no HTML
        print(f"Error en obtener_estadisticas: {e}")
        return jsonify({'success': False, 'message': 'Error interno del servidor al obtener estadísticas.'}), 500


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
    try:
        connection = get_db_connection()
        print("¡Conexión exitosa a la base de datos!")
    except Exception as e:
        print(f"Error de conexión: {e}")

    # 🚀 Iniciar el servidor Flask
    app.run(host='0.0.0.0', port=5000, debug=True)
