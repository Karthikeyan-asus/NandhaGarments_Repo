
-- Create database
CREATE DATABASE IF NOT EXISTS NandhaGarmentsDB;
USE NandhaGarmentsDB;

-- Super Admin Table
CREATE TABLE IF NOT EXISTS super_admins (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  pan VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  gstin VARCHAR(20) NOT NULL,
  logo VARCHAR(255),
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES super_admins(id)
);

-- Organization Admins Table
CREATE TABLE IF NOT EXISTS org_admins (
  id VARCHAR(36) PRIMARY KEY,
  org_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Organization Users Table
CREATE TABLE IF NOT EXISTS org_users (
  id VARCHAR(36) PRIMARY KEY,
  org_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  age INT,
  department VARCHAR(100),
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES org_admins(id)
);

-- Individual Users Table
CREATE TABLE IF NOT EXISTS individuals (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

-- Measurement Types Table
CREATE TABLE IF NOT EXISTS measurement_types (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Measurement Sections Table
CREATE TABLE IF NOT EXISTS measurement_sections (
  id VARCHAR(36) PRIMARY KEY,
  measurement_type_id VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (measurement_type_id) REFERENCES measurement_types(id)
);

-- Measurement Fields Table
CREATE TABLE IF NOT EXISTS measurement_fields (
  id VARCHAR(36) PRIMARY KEY,
  section_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20),
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES measurement_sections(id)
);

-- Measurements Table (for both org users and individuals)
CREATE TABLE IF NOT EXISTS measurements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_type ENUM('org_user', 'individual') NOT NULL,
  measurement_type_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (measurement_type_id) REFERENCES measurement_types(id)
);

-- Measurement Values Table
CREATE TABLE IF NOT EXISTS measurement_values (
  id VARCHAR(36) PRIMARY KEY,
  measurement_id VARCHAR(36) NOT NULL,
  field_id VARCHAR(36) NOT NULL,
  value VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES measurement_fields(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_type ENUM('org_admin', 'individual') NOT NULL,
  org_user_id VARCHAR(36),
  status ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Initial Super Admin
INSERT INTO super_admins (id, name, email, password, is_first_login)
VALUES ('sa-001', 'Admin', 'mk@admin.com', 'mk@admin', FALSE);

-- Insert Measurement Types
INSERT INTO measurement_types (id, name, description)
VALUES
('mt-001', 'school_uniform', 'Measurements for school uniforms'),
('mt-002', 'sports_wear', 'Measurements for sports attire'),
('mt-003', 'corporate_wear', 'Measurements for corporate attire'),
('mt-004', 'casual_wear', 'Measurements for casual clothing');

-- Insert Product Categories
INSERT INTO product_categories (id, name, description)
VALUES
('pc-001', 'school_uniform', 'School uniform products'),
('pc-002', 'sports_wear', 'Sports wear products'),
('pc-003', 'corporate_wear', 'Corporate attire products'),
('pc-004', 'casual_wear', 'Casual clothing products');
