import uuid
import logging
from flask import Blueprint, request, jsonify
from db import execute_query

auth = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth.route('/login/super_admin', methods=['POST'])
def login_super_admin():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'success': False, 'message': 'Missing email or password'}), 400
        
        query = "SELECT * FROM super_admins WHERE email = %s AND password = %s"
        result = execute_query(query, (data['email'], data['password']))
        
        if result:
            admin = result[0]
            return jsonify({
                'success': True,
                'user': {
                    'id': admin['id'],
                    'name': admin['name'],
                    'email': admin['email'],
                    'role': 'super_admin',
                    'isFirstLogin': admin['is_first_login']
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        logging.error(f"Super admin login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500

@auth.route('/login/org_admin', methods=['POST'])
def login_org_admin():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'success': False, 'message': 'Missing email or password'}), 400
        
        query = """
            SELECT oa.*, o.name as org_name 
            FROM org_admins oa 
            JOIN organizations o ON oa.org_id = o.id 
            WHERE oa.email = %s AND oa.password = %s
        """
        result = execute_query(query, (data['email'], data['password']))
        
        if result:
            admin = result[0]
            return jsonify({
                'success': True,
                'user': {
                    'id': admin['id'],
                    'name': admin['name'],
                    'email': admin['email'],
                    'role': 'org_admin',
                    'org_id': admin['org_id'],
                    'org_name': admin['org_name'],
                    'isFirstLogin': admin['is_first_login']
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        logging.error(f"Org admin login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500

@auth.route('/login/individual', methods=['POST'])
def login_individual():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'success': False, 'message': 'Missing email or password'}), 400
        
        query = "SELECT * FROM individuals WHERE email = %s AND password = %s"
        result = execute_query(query, (data['email'], data['password']))
        
        if result:
            user = result[0]
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'role': 'individual'
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        logging.error(f"Individual login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500

@auth.route('/reset_password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        
        if not data or 'user_type' not in data or 'email' not in data or 'new_password' not in data:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        user_type = data['user_type']
        email = data['email']
        new_password = data['new_password']
        
        if user_type == 'super_admin':
            query = "UPDATE super_admins SET password = %s, is_first_login = FALSE WHERE email = %s"
        elif user_type == 'org_admin':
            query = "UPDATE org_admins SET password = %s, is_first_login = FALSE WHERE email = %s"
        elif user_type == 'individual':
            query = "UPDATE individuals SET password = %s WHERE email = %s"
        else:
            return jsonify({'success': False, 'message': 'Invalid user type'}), 400
        
        execute_query(query, (new_password, email), fetch=False)
        
        return jsonify({'success': True, 'message': 'Password reset successfully'})
        
    except Exception as e:
        logging.error(f"Password reset error: {str(e)}")
        return jsonify({'success': False, 'message': 'Password reset failed'}), 500