import uuid
from flask import Blueprint, request, jsonify
from db import execute_query, execute_many

measurements = Blueprint('measurements', __name__, url_prefix='/api/measurements')

@measurements.route('/types', methods=['GET'])
def get_measurement_types():
    try:
        query = "SELECT * FROM measurement_types"
        result = execute_query(query)
        
        return jsonify({'success': True, 'types': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/type', methods=['POST'])
def add_measurement_type():
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'success': False, 'message': 'Missing name field'}), 400
    
    try:
        type_id = f"mt-{uuid.uuid4().hex[:8]}"
        query = "INSERT INTO measurement_types (id, name, description) VALUES (%s, %s, %s)"
        execute_query(query, (type_id, data['name'], data.get('description')), fetch=False)
        
        return jsonify({'success': True, 'id': type_id, 'message': 'Measurement type added successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/type/<type_id>/sections', methods=['GET'])
def get_measurement_sections(type_id):
    try:
        query = "SELECT * FROM measurement_sections WHERE measurement_type_id = %s ORDER BY display_order"
        sections = execute_query(query, (type_id,))
        
        for section in sections:
            fields_query = "SELECT * FROM measurement_fields WHERE section_id = %s ORDER BY display_order"
            fields = execute_query(fields_query, (section['id'],))
            section['fields'] = fields
        
        return jsonify({'success': True, 'sections': sections})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/<user_id>/<user_type>', methods=['GET'])
def get_measurements(user_id, user_type):
    try:
        if user_type not in ['org_user', 'individual']:
            return jsonify({'success': False, 'message': 'Invalid user type'}), 400
        
        query = "SELECT * FROM measurements WHERE user_id = %s AND user_type = %s"
        measurements_list = execute_query(query, (user_id, user_type))
        
        result = []
        for m in measurements_list:
            values_query = """
                SELECT mv.*, mf.name as field_name, mf.unit, ms.title as section_title 
                FROM measurement_values mv
                JOIN measurement_fields mf ON mv.field_id = mf.id
                JOIN measurement_sections ms ON mf.section_id = ms.id
                WHERE mv.measurement_id = %s
            """
            values = execute_query(values_query, (m['id'],))
            
            type_query = "SELECT name FROM measurement_types WHERE id = %s"
            type_result = execute_query(type_query, (m['measurement_type_id'],))
            
            result.append({
                'id': m['id'],
                'type_id': m['measurement_type_id'],
                'type_name': type_result[0]['name'] if type_result else '',
                'created_at': m['created_at'],
                'updated_at': m['updated_at'],
                'values': values
            })
        
        return jsonify({'success': True, 'measurements': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/<org_id>/org_measurements', methods=['GET'])
def get_org_measurements(org_id):
    try:
        query = """
            SELECT m.*, ou.name as user_name, mt.name as measurement_type 
            FROM measurements m
            JOIN org_users ou ON m.user_id = ou.id
            JOIN measurement_types mt ON m.measurement_type_id = mt.id
            WHERE m.user_type = 'org_user' AND ou.org_id = %s
        """
        result = execute_query(query, (org_id,))
        
        return jsonify({'success': True, 'measurements': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/<measurement_id>', methods=['GET'])
def get_measurement_details(measurement_id):
    try:
        query = """
            SELECT m.*, mt.name as type_name 
            FROM measurements m
            JOIN measurement_types mt ON m.measurement_type_id = mt.id
            WHERE m.id = %s
        """
        measurement = execute_query(query, (measurement_id,))
        
        if not measurement:
            return jsonify({'success': False, 'message': 'Measurement not found'}), 404
        
        values_query = """
            SELECT mv.*, mf.name as field_name, mf.unit, ms.title as section_title, ms.id as section_id
            FROM measurement_values mv
            JOIN measurement_fields mf ON mv.field_id = mf.id
            JOIN measurement_sections ms ON mf.section_id = ms.id
            WHERE mv.measurement_id = %s
        """
        values = execute_query(values_query, (measurement_id,))
        
        # Group values by section
        sections = {}
        for value in values:
            section_id = value['section_id']
            if section_id not in sections:
                sections[section_id] = {
                    'id': section_id,
                    'title': value['section_title'],
                    'values': []
                }
            sections[section_id]['values'].append({
                'id': value['id'],
                'field_id': value['field_id'],
                'field_name': value['field_name'],
                'unit': value['unit'],
                'value': value['value']
            })
        
        result = {
            'id': measurement[0]['id'],
            'user_id': measurement[0]['user_id'],
            'user_type': measurement[0]['user_type'],
            'type_id': measurement[0]['measurement_type_id'],
            'type_name': measurement[0]['type_name'],
            'created_at': measurement[0]['created_at'],
            'updated_at': measurement[0]['updated_at'],
            'sections': list(sections.values())
        }
        
        return jsonify({'success': True, 'measurement': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/', methods=['POST'])
def add_measurements():
    data = request.get_json()
    
    if not data or not all(key in data for key in ['user_id', 'user_type', 'measurement_type_id', 'values']):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    if not isinstance(data['values'], list) or not data['values']:
        return jsonify({'success': False, 'message': 'Values must be a non-empty list'}), 400
    
    try:
        measurement_id = f"m-{uuid.uuid4().hex[:8]}"
        
        # Insert measurement record
        query = """
            INSERT INTO measurements (id, user_id, user_type, measurement_type_id)
            VALUES (%s, %s, %s, %s)
        """
        execute_query(query, (
            measurement_id, data['user_id'], data['user_type'], data['measurement_type_id']
        ), fetch=False)
        
        # Insert measurement values
        values_params = []
        for value in data['values']:
            if 'field_id' not in value or 'value' not in value:
                continue
            
            value_id = f"mv-{uuid.uuid4().hex[:8]}"
            values_params.append((value_id, measurement_id, value['field_id'], value['value']))
        
        if values_params:
            values_query = """
                INSERT INTO measurement_values (id, measurement_id, field_id, value)
                VALUES (%s, %s, %s, %s)
            """
            execute_many(values_query, values_params)
        
        return jsonify({
            'success': True,
            'id': measurement_id,
            'message': 'Measurements added successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/<measurement_id>', methods=['PUT'])
def update_measurements(measurement_id):
    data = request.get_json()
    
    if not data or 'values' not in data or not isinstance(data['values'], list):
        return jsonify({'success': False, 'message': 'Missing or invalid values field'}), 400
    
    try:
        # First, check if measurement exists
        check_query = "SELECT id FROM measurements WHERE id = %s"
        exists = execute_query(check_query, (measurement_id,))
        
        if not exists:
            return jsonify({'success': False, 'message': 'Measurement not found'}), 404
        
        # Update measurement values
        for value in data['values']:
            if 'id' in value and 'value' in value:
                # Update existing value
                update_query = "UPDATE measurement_values SET value = %s WHERE id = %s AND measurement_id = %s"
                execute_query(update_query, (value['value'], value['id'], measurement_id), fetch=False)
            elif 'field_id' in value and 'value' in value:
                # Check if value exists for this field
                check_value_query = """
                    SELECT id FROM measurement_values 
                    WHERE measurement_id = %s AND field_id = %s
                """
                existing_value = execute_query(check_value_query, (measurement_id, value['field_id']))
                
                if existing_value:
                    # Update existing value
                    update_query = "UPDATE measurement_values SET value = %s WHERE id = %s"
                    execute_query(update_query, (value['value'], existing_value[0]['id']), fetch=False)
                else:
                    # Insert new value
                    value_id = f"mv-{uuid.uuid4().hex[:8]}"
                    insert_query = """
                        INSERT INTO measurement_values (id, measurement_id, field_id, value)
                        VALUES (%s, %s, %s, %s)
                    """
                    execute_query(insert_query, (
                        value_id, measurement_id, value['field_id'], value['value']
                    ), fetch=False)
        
        # Update the measurement's updated_at timestamp
        update_measurement_query = "UPDATE measurements SET updated_at = CURRENT_TIMESTAMP WHERE id = %s"
        execute_query(update_measurement_query, (measurement_id,), fetch=False)
        
        return jsonify({'success': True, 'message': 'Measurements updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/<measurement_id>', methods=['DELETE'])
def delete_measurement(measurement_id):
    try:
        # Delete all measurement values first (cascading would work too but being explicit)
        values_query = "DELETE FROM measurement_values WHERE measurement_id = %s"
        execute_query(values_query, (measurement_id,), fetch=False)
        
        # Then delete the measurement
        query = "DELETE FROM measurements WHERE id = %s"
        execute_query(query, (measurement_id,), fetch=False)
        
        return jsonify({'success': True, 'message': 'Measurement deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@measurements.route('/all', methods=['GET'])
def get_all_measurements():
    try:
        query = """
            SELECT m.*, 
                   CASE 
                     WHEN m.user_type = 'org_user' THEN ou.name 
                     WHEN m.user_type = 'individual' THEN i.name 
                   END as user_name,
                   mt.name as measurement_type_name
            FROM measurements m
            LEFT JOIN org_users ou ON m.user_id = ou.id AND m.user_type = 'org_user'
            LEFT JOIN individuals i ON m.user_id = i.id AND m.user_type = 'individual'
            JOIN measurement_types mt ON m.measurement_type_id = mt.id
        """
        result = execute_query(query)
        
        return jsonify({'success': True, 'measurements': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500