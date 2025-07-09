import uuid
import logging
from flask import Blueprint, request, jsonify
from db import execute_query

users = Blueprint('users', __name__, url_prefix='/api/users')

@users.route('/super_admin', methods=['POST'])
def create_super_admin():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['name', 'email', 'password']):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        admin_id = f"sa-{uuid.uuid4().hex[:8]}"
        query = """
            INSERT INTO super_admins (id, name, email, password, is_first_login)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(query, (admin_id, data['name'], data['email'], data['password'], True), fetch=False)
        
        return jsonify({'success': True, 'id': admin_id, 'message': 'Super admin created successfully'})
        
    except Exception as e:
        logging.error(f"Create super admin error: {str(e)}")
        if 'Duplicate entry' in str(e):
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        return jsonify({'success': False, 'message': 'Failed to create super admin'}), 500

@users.route('/super_admin/<admin_id>', methods=['PUT'])
def modify_super_admin(admin_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        valid_fields = ['name', 'email', 'password']
        update_fields = []
        params = []
        
        for field in valid_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No valid fields to update'}), 400
        
        params.append(admin_id)
        query = f"UPDATE super_admins SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params, fetch=False)
        
        return jsonify({'success': True, 'message': 'Super admin updated successfully'})
        
    except Exception as e:
        logging.error(f"Update super admin error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update super admin'}), 500

@users.route('/super_admin/<admin_id>', methods=['DELETE'])
def delete_super_admin(admin_id):
    try:
        query = "DELETE FROM super_admins WHERE id = %s"
        execute_query(query, (admin_id,), fetch=False)
        
        return jsonify({'success': True, 'message': 'Super admin deleted successfully'})
        
    except Exception as e:
        logging.error(f"Delete super admin error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete super admin'}), 500

@users.route('/super_admin/all', methods=['GET'])
def get_all_super_admins():
    try:
        query = "SELECT id, name, email, created_at, updated_at FROM super_admins"
        result = execute_query(query)
        
        return jsonify({'success': True, 'admins': result})
        
    except Exception as e:
        logging.error(f"Get super admins error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch super admins'}), 500

@users.route('/organization', methods=['POST'])
def create_organization():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['name', 'pan', 'email', 'phone', 'address', 'gstin', 'created_by']):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        org_id = f"org-{uuid.uuid4().hex[:8]}"
        query = """
            INSERT INTO organizations (id, name, pan, email, phone, address, gstin, logo, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        execute_query(query, (
            org_id, data['name'], data['pan'], data['email'], data['phone'],
            data['address'], data['gstin'], data.get('logo'), data['created_by']
        ), fetch=False)
        
        return jsonify({'success': True, 'id': org_id, 'message': 'Organization created successfully'})
        
    except Exception as e:
        logging.error(f"Create organization error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create organization'}), 500

@users.route('/org_admin', methods=['POST'])
def create_org_admin():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['org_id', 'name', 'email', 'password']):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        admin_id = f"oa-{uuid.uuid4().hex[:8]}"
        query = """
            INSERT INTO org_admins (id, org_id, name, email, password, is_first_login)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        execute_query(query, (
            admin_id, data['org_id'], data['name'], data['email'], data['password'], True
        ), fetch=False)
        
        return jsonify({'success': True, 'id': admin_id, 'message': 'Organization admin created successfully'})
        
    except Exception as e:
        logging.error(f"Create org admin error: {str(e)}")
        if 'Duplicate entry' in str(e):
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        return jsonify({'success': False, 'message': 'Failed to create organization admin'}), 500

@users.route('/org_admin/<admin_id>', methods=['PUT'])
def modify_org_admin(admin_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        valid_fields = ['org_id', 'name', 'email', 'password']
        update_fields = []
        params = []
        
        for field in valid_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No valid fields to update'}), 400
        
        params.append(admin_id)
        query = f"UPDATE org_admins SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params, fetch=False)
        
        return jsonify({'success': True, 'message': 'Organization admin updated successfully'})
        
    except Exception as e:
        logging.error(f"Update org admin error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update organization admin'}), 500

@users.route('/org_admin/<admin_id>', methods=['DELETE'])
def delete_org_admin(admin_id):
    try:
        query = "DELETE FROM org_admins WHERE id = %s"
        execute_query(query, (admin_id,), fetch=False)
        
        return jsonify({'success': True, 'message': 'Organization admin deleted successfully'})
        
    except Exception as e:
        logging.error(f"Delete org admin error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete organization admin'}), 500

@users.route('/org_admin/all', methods=['GET'])
def get_all_org_admins():
    try:
        query = """
            SELECT oa.*, o.name as org_name 
            FROM org_admins oa 
            JOIN organizations o ON oa.org_id = o.id
        """
        result = execute_query(query)
        
        return jsonify({'success': True, 'admins': result})
        
    except Exception as e:
        logging.error(f"Get org admins error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch organization admins'}), 500

@users.route('/org_admin/by_org/<org_id>', methods=['GET'])
def get_org_admins_by_org(org_id):
    try:
        query = "SELECT * FROM org_admins WHERE org_id = %s"
        result = execute_query(query, (org_id,))
        
        return jsonify({'success': True, 'admins': result})
        
    except Exception as e:
        logging.error(f"Get org admins by org error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch organization admins'}), 500

@users.route('/org_user', methods=['POST'])
def create_org_user():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in [
            'org_id', 'name', 'email', 'phone', 'address', 'created_by'
        ]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        user_id = f"ou-{uuid.uuid4().hex[:8]}"
        query = """
            INSERT INTO org_users (id, org_id, name, email, phone, address, age, department, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        execute_query(query, (
            user_id, data['org_id'], data['name'], data['email'], data['phone'],
            data['address'], data.get('age'), data.get('department'), data['created_by']
        ), fetch=False)
        
        return jsonify({'success': True, 'id': user_id, 'message': 'Organization user created successfully'})
        
    except Exception as e:
        logging.error(f"Create org user error: {str(e)}")
        if 'Duplicate entry' in str(e):
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        return jsonify({'success': False, 'message': 'Failed to create organization user'}), 500

@users.route('/org_user/<user_id>', methods=['PUT'])
def modify_org_user(user_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        valid_fields = ['org_id', 'name', 'email', 'phone', 'address', 'age', 'department']
        update_fields = []
        params = []
        
        for field in valid_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No valid fields to update'}), 400
        
        params.append(user_id)
        query = f"UPDATE org_users SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params, fetch=False)
        
        return jsonify({'success': True, 'message': 'Organization user updated successfully'})
        
    except Exception as e:
        logging.error(f"Update org user error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update organization user'}), 500

@users.route('/org_user/<user_id>', methods=['DELETE'])
def delete_org_user(user_id):
    try:
        query = "DELETE FROM org_users WHERE id = %s"
        execute_query(query, (user_id,), fetch=False)
        
        return jsonify({'success': True, 'message': 'Organization user deleted successfully'})
        
    except Exception as e:
        logging.error(f"Delete org user error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete organization user'}), 500

@users.route('/org_user/all', methods=['GET'])
def get_all_org_users():
    try:
        query = """
            SELECT ou.*, o.name as org_name 
            FROM org_users ou 
            JOIN organizations o ON ou.org_id = o.id
        """
        result = execute_query(query)
        
        return jsonify({'success': True, 'users': result})
        
    except Exception as e:
        logging.error(f"Get org users error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch organization users'}), 500

@users.route('/org_user/by_org/<org_id>', methods=['GET'])
def get_org_users_by_org(org_id):
    try:
        query = "SELECT * FROM org_users WHERE org_id = %s"
        result = execute_query(query, (org_id,))
        
        return jsonify({'success': True, 'users': result})
        
    except Exception as e:
        logging.error(f"Get org users by org error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch organization users'}), 500

@users.route('/individual', methods=['POST'])
def create_individual():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['name', 'email', 'password', 'phone', 'address']):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        user_id = f"ind-{uuid.uuid4().hex[:8]}"
        query = """
            INSERT INTO individuals (id, name, email, password, phone, address, age)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        execute_query(query, (
            user_id, data['name'], data['email'], data['password'],
            data['phone'], data['address'], data.get('age')
        ), fetch=False)
        
        return jsonify({'success': True, 'id': user_id, 'message': 'Individual user created successfully'})
        
    except Exception as e:
        logging.error(f"Create individual error: {str(e)}")
        if 'Duplicate entry' in str(e):
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        return jsonify({'success': False, 'message': 'Failed to create individual user'}), 500

@users.route('/individual/<user_id>', methods=['PUT'])
def modify_individual(user_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        valid_fields = ['name', 'email', 'password', 'phone', 'address', 'age']
        update_fields = []
        params = []
        
        for field in valid_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No valid fields to update'}), 400
        
        params.append(user_id)
        query = f"UPDATE individuals SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params, fetch=False)
        
        return jsonify({'success': True, 'message': 'Individual user updated successfully'})
        
    except Exception as e:
        logging.error(f"Update individual error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update individual user'}), 500

@users.route('/individual/<user_id>', methods=['DELETE'])
def delete_individual(user_id):
    try:
        query = "DELETE FROM individuals WHERE id = %s"
        execute_query(query, (user_id,), fetch=False)
        
        return jsonify({'success': True, 'message': 'Individual user deleted successfully'})
        
    except Exception as e:
        logging.error(f"Delete individual error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete individual user'}), 500

@users.route('/individual/all', methods=['GET'])
def get_all_individuals():
    try:
        query = "SELECT id, name, email, phone, address, age, created_at, updated_at FROM individuals"
        result = execute_query(query)
        
        return jsonify({'success': True, 'users': result})
        
    except Exception as e:
        logging.error(f"Get individuals error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch individual users'}), 500