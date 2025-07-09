
// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'org_admin' | 'org_user' | 'individual';

export interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin';
  isFirstLogin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  logo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUser {
  id: string;
  orgId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  age: number;
  department: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Individual {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

// Measurement types
export interface Measurement {
  id: string;
  userId: string;
  userType: 'org_user' | 'individual';
  type: MeasurementType;
  sections: MeasurementSection[];
  createdAt: string;
  updatedAt: string;
}

export type MeasurementType = 'school_uniform' | 'sports_wear' | 'corporate_wear' | 'casual_wear';

export interface MeasurementSection {
  title: string;
  fields: MeasurementField[];
}

export interface MeasurementField {
  name: string;
  value: string;
  unit: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = 'school_uniform' | 'sports_wear' | 'corporate_wear' | 'casual_wear';

// Order types
export interface Order {
  id: string;
  userId: string;
  userType: 'org_admin' | 'individual';
  orgUserId?: string;
  status: OrderStatus;
  products: OrderProduct[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  age?: number;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
