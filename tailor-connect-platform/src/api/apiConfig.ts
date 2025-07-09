
// API configuration and common utilities
const API_BASE_URL = 'http://localhost:5000/api';

// Common headers for API requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API request handler
export const apiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  data?: any
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: getHeaders(),
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    return responseData as T;
  } catch (error) {
    console.error(`API ${method} request failed:`, error);
    throw error;
  }
};

export const endpoints = {
  // Auth endpoints
  auth: {
    loginSuperAdmin: '/auth/login/super_admin',
    loginOrgAdmin: '/auth/login/org_admin',
    loginIndividual: '/auth/login/individual',
    resetPassword: '/auth/reset_password',
  },
  
  // Users endpoints
  users: {
    superAdmin: {
      create: '/users/super_admin',
      update: (id: string) => `/users/super_admin/${id}`,
      delete: (id: string) => `/users/super_admin/${id}`,
      getAll: '/users/super_admin/all',
    },
    organization: {
      create: '/users/organization',
    },
    orgAdmin: {
      create: '/users/org_admin',
      update: (id: string) => `/users/org_admin/${id}`,
      delete: (id: string) => `/users/org_admin/${id}`,
      getAll: '/users/org_admin/all',
      getByOrg: (orgId: string) => `/users/org_admin/by_org/${orgId}`,
    },
    orgUser: {
      create: '/users/org_user',
      update: (id: string) => `/users/org_user/${id}`,
      delete: (id: string) => `/users/org_user/${id}`,
      getAll: '/users/org_user/all',
      getByOrg: (orgId: string) => `/users/org_user/by_org/${orgId}`,
    },
    individual: {
      create: '/users/individual',
    },
  },
  
  // Measurements endpoints
  measurements: {
    types: {
      getAll: '/measurements/types',
      create: '/measurements/type',
      getSections: (typeId: string) => `/measurements/type/${typeId}/sections`,
    },
    getByUser: (userId: string, userType: string) => `/measurements/${userId}/${userType}`,
    getByOrg: (orgId: string) => `/measurements/${orgId}/org_measurements`,
    getById: (id: string) => `/measurements/${id}`,
    create: '/measurements',
    update: (id: string) => `/measurements/${id}`,
    delete: (id: string) => `/measurements/${id}`,
    getAll: '/measurements/all',
  },
  
  // Products endpoints
  products: {
    categories: {
      getAll: '/products/categories',
      create: '/products/category',
    },
    getAll: '/products',
    getById: (id: string) => `/products/${id}`,
    getByCategory: (categoryId: string) => `/products/category/${categoryId}`,
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  
  // Orders endpoints
  orders: {
    create: '/orders',
    getById: (id: string) => `/orders/${id}`,
    getAll: '/orders/all',
    getByUser: (userId: string, userType: string) => `/orders/user/${userId}/${userType}`,
    getByOrg: (orgId: string) => `/orders/org/${orgId}`,
    updateStatus: (id: string) => `/orders/${id}/status`,
  },
};
