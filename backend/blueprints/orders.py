from flask import Blueprint, request, jsonify
from db import get_connection
import uuid

orders_bp = Blueprint('orders', __name__, url_prefix='/orders')

@orders_bp.route('/create', methods=['POST'])
def create_order():
    try:
        data = request.json
        conn = get_connection()
        with conn.cursor() as cursor:
            oid = str(uuid.uuid4())
            cursor.execute("INSERT INTO orders (id, user_id, user_type, org_user_id, status, total_amount) VALUES (%s, %s, %s, %s, %s, %s)", 
                           (oid, data['user_id'], data['user_type'], data.get('org_user_id'), 'pending', data['total_amount']))
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'order_id': oid})
    except Exception as e:
        return jsonify({'error': str(e)})

@orders_bp.route('/details/<order_id>', methods=['GET'])
def get_order(order_id):
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM orders WHERE id=%s", (order_id,))
            result = cursor.fetchone()
        conn.close()
        return jsonify(result if result else {})
    except Exception as e:
        return jsonify({'error': str(e)})

@orders_bp.route('/update_status', methods=['POST'])
def update_status():
    try:
        data = request.json
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("UPDATE orders SET status=%s WHERE id=%s", (data['status'], data['order_id']))
            conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)})
