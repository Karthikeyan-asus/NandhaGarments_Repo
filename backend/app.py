import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import create_db_if_not_exists
from init_db import create_tables

from blueprints.auth import auth
from blueprints.users import users
from blueprints.measurements import measurements
from blueprints.products import products
from blueprints.orders import orders_bp

if not os.path.exists('logs'):
    os.makedirs('logs')

logging.basicConfig(
    filename=Config.LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.register_blueprint(auth)
    app.register_blueprint(users)
    app.register_blueprint(measurements)
    app.register_blueprint(products)
    app.register_blueprint(orders_bp)
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def server_error(error):
        logging.error(f"Server error: {str(error)}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'success': True, 'message': 'Server is running'})
    
    return app

if __name__ == '__main__':
    try:
        create_db_if_not_exists()
        create_tables()
        
        app = create_app()
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"Error starting application: {str(e)}")