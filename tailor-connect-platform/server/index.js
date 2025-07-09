
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize express app
const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock database (in a real app, this would be a connection to MySQL)
const mockDatabase = require('../src/lib/mock-database').mockDatabase;

// JWT Secret (in a real app, this would be in an environment variable)
const JWT_SECRET = 'nandha-garments-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const allUsers = [
    ...mockDatabase.superAdmins,
    ...mockDatabase.orgAdmins,
    ...mockDatabase.individuals
  ];
  
  const user = allUsers.find(user => user.email === email);
  
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  
  // Check password
  const validPassword = mockDatabase.userPasswords[user.id] === password;
  
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid password' });
  }
  
  // Create token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  // Return user data (without password) and token
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    user: userWithoutPassword,
    token
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  
  // Check if user already exists
  const existingUser = mockDatabase.individuals.find(user => user.email === email);
  
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create new user ID
  const userId = `ind-${uuidv4()}`;
  
  // In a real app, we would add the user to the database
  // For now, we'll just return success
  
  res.status(201).json({ message: 'User created successfully' });
});

// User routes
app.get('/api/users', authenticateToken, (req, res) => {
  // Only super admins can access all users
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const users = {
    superAdmins: mockDatabase.superAdmins.map(({ password, ...user }) => user),
    organizations: mockDatabase.organizations,
    orgAdmins: mockDatabase.orgAdmins.map(({ password, ...user }) => user),
    orgUsers: mockDatabase.orgUsers,
    individuals: mockDatabase.individuals.map(({ password, ...user }) => user)
  };
  
  res.json(users);
});

// Organization routes
app.post('/api/organizations', authenticateToken, (req, res) => {
  // Only super admins can create organizations
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { name, pan, email, phone, address, gstin, initialPassword } = req.body;
  
  // In a real app, we would add the organization to the database
  // and create an admin user with the initialPassword
  // The isFirstLogin flag would be set to true
  
  res.status(201).json({ 
    message: 'Organization created successfully',
    isFirstLogin: true
  });
});

// Organization users routes
app.get('/api/organizations/:orgId/users', authenticateToken, (req, res) => {
  const { orgId } = req.params;
  
  // Check if user has access to this organization
  if (req.user.role !== 'super_admin' && 
      req.user.role !== 'org_admin' && 
      req.user.orgId !== orgId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const orgUsers = mockDatabase.orgUsers.filter(user => user.orgId === orgId);
  
  res.json(orgUsers);
});

app.post('/api/organizations/:orgId/users', authenticateToken, (req, res) => {
  const { orgId } = req.params;
  
  // Check if user has access to this organization
  if (req.user.role !== 'org_admin' || req.user.orgId !== orgId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { name, email, phone, address, age, department, initialPassword } = req.body;
  
  // In a real app, we would add the user to the database
  // with the initialPassword and isFirstLogin set to true
  
  res.status(201).json({ 
    message: 'User created successfully',
    isFirstLogin: true
  });
});

// Product routes
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  
  let products = [...mockDatabase.products];
  
  if (category) {
    products = products.filter(product => product.category === category);
  }
  
  res.json(products);
});

// Measurements routes
app.get('/api/measurements', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userType = req.user.role === 'individual' ? 'individual' : 'org_user';
  
  const measurements = mockDatabase.measurements.filter(
    m => m.userId === userId && m.userType === userType
  );
  
  res.json(measurements);
});

app.post('/api/measurements', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userType = req.user.role === 'individual' ? 'individual' : 'org_user';
  
  const { type, sections } = req.body;
  
  // In a real app, we would add the measurements to the database
  // For now, we'll just return success
  
  res.status(201).json({ message: 'Measurements saved successfully' });
});

// Orders routes
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  let orders;
  
  if (req.user.role === 'super_admin') {
    // Super admins can see all orders
    orders = mockDatabase.orders;
  } else {
    // Others can only see their own orders
    orders = mockDatabase.orders.filter(order => order.userId === userId);
  }
  
  res.json(orders);
});

app.post('/api/orders', authenticateToken, (req, res) => {
  const { products, orgUserId } = req.body;
  
  // Calculate total amount
  const totalAmount = products.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
  
  // Create order ID
  const orderId = `order-${uuidv4()}`;
  
  // In a real app, we would add the order to the database
  // For now, we'll just return success
  
  res.status(201).json({
    message: 'Order placed successfully',
    orderId
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
