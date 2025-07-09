import pymysql
from config import Config

def get_connection():
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        db=Config.MYSQL_DB,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def execute_query(query, params=None, fetch=True):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            if fetch:
                result = cursor.fetchall()
                return result
            connection.commit()
            return cursor.lastrowid
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()

def execute_many(query, params_list):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.executemany(query, params_list)
            connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()

def create_db_if_not_exists():
    try:
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD
        )
        
        with conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS NandhaGarmentsDB")
        conn.close()
    except Exception as e:
        raise e