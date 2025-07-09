import uuid
from flask import Blueprint, request, jsonify
from db import execute_query

products = Blueprint('products', __name__, url_prefix='/api/products')

@products.route('/categories', methods=['GET'])
def get_product_categories():
    try:
        query = "SELECT * FROM product_categories"
        result = execute_query(query)
        
        return jsonify({'success': True, 'categories': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@products.route('/category', methods=['POST'])
def add_product_category():
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'success': False, 'message': 'Missing name field'}), 400
    
    try:
        category_id = f"pc-{uuid.uuid4().hex[:8]}"
        query = "INSERT INTO product_categories (id, name, description) VALUES (%s, %s, %s)"
        execute_query(query, (category_id, data['name'], data.get('description')), fetch=False)
        
        return jsonify({'success': True, 'id': category_id, 'message': 'Product category added successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@products.route('/', methods=['GET'])
def get_products():
    try:
        query = """
            SELECT p.*, pc.name as category_name 
            FROM products p
            JOIN product_categories pc ON p.category_id = pc.id
        """
        result = execute_query(query)
        
        return jsonify({'success': True, 'products': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@products.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        query = """
            SELECT p.*, pc.name as category_name 
            FROM products p
            JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.id = %s
        """
        result = execute_query(query, (product_id,))
        
        if not result:
            return jsonify({'success': False, 'message': 'Product not found'}), 404
        
        return jsonify({'success': True, 'product': result[0]})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@products.route('/category/<category_id>', methods=['GET'])
def get_products_by_category(category_id):
    try:
        query = """
            SELECT p.*, pc.name as category_name 
            FROM products p
            JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.category_id = %s
        """
        result = execute_query(query, (category_id,))
        
        return jsonify({'success': True, 'products': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@products.route('/', methods=['POST'])
def add_product():
    data = request.get_json()
    
    if not data or not all(key in data for key in ['name', 'category_id', 'price']):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        product_id = f"p-{uuid.uuid4().hex[:8]}"
        query = """
            INSERT INTO      (id, name, category_id, description, price, image)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        execute_query(query, (
            product_id, data['name'], data['category_id'], 
            data.get('description'), data['price'], data.get('image')
        ), fetch=False)
        
        return jsonify({'success': True, 'id': product_id, 'message': 'Product added successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@products.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    try:
        valid_fields = ['name', 'category_id', 'description', 'price', 'image']
        update_fields = []
        params = []
        
        for field in valid_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No valid fields to update'}), 400
        
        params.append(product_id)
        query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params, fetch=False)
        
        return jsonify({'success': True, 'message': 'Product updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@products.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        query = "DELETE FROM products WHERE id = %s"
        execute_query(query, (product_id,), fetch=False)
        
        return jsonify({'success': True, 'message': 'Product deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500