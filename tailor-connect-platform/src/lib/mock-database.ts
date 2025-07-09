import { 
  SuperAdmin, 
  Organization, 
  OrganizationUser, 
  Individual, 
  Product, 
  Order, 
  Measurement,
  MeasurementType
} from '../types';

// Initial super admin
const superAdmins = [
  {
    id: 'sa-001',
    email: 'mk@admin.com',
    name: 'Admin',
    password: 'mk@admin',
    role: 'super_admin' as const,
    isFirstLogin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Organizations
const organizations: Organization[] = [
  {
    id: 'org-001',
    name: 'ABC Corp',
    pan: 'ABCDE1234F',
    email: 'admin@abccorp.com',
    phone: '9876543210',
    address: '123 Main St, Business District',
    gstin: '29ABCDE1234F1Z5',
    logo: undefined,
    createdBy: 'sa-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Organization admins
const orgAdmins = [
  {
    id: 'oa-001',
    email: 'admin@abccorp.com',
    name: 'John Smith',
    password: 'password123',
    role: 'org_admin' as const,
    orgId: 'org-001',
    isFirstLogin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Organization users
const orgUsers: OrganizationUser[] = [
  {
    id: 'ou-001',
    orgId: 'org-001',
    name: 'Jane Doe',
    email: 'jane@abccorp.com',
    phone: '9876543211',
    address: '456 Worker St, Residential Area',
    age: 28,
    department: 'Finance',
    createdBy: 'oa-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ou-002',
    orgId: 'org-001',
    name: 'Robert Smith',
    email: 'robert@abccorp.com',
    phone: '9876543212',
    address: '789 Business Ave, Downtown',
    age: 35,
    department: 'Marketing',
    createdBy: 'oa-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Individual users
const individuals = [
  {
    id: 'ind-001',
    name: 'John Wilson',
    email: 'john@example.com',
    password: 'password123',
    phone: '9876543213',
    address: '101 Residence St, Suburb Area',
    age: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ind-002',
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    password: 'password456',
    phone: '9876543214',
    address: '202 Home Rd, City Center',
    age: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Products
const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Classic White Shirt',
    category: 'corporate_wear',
    description: 'A professional white shirt suitable for office wear',
    price: 1200,
    image: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    name: 'Navy Blue Trousers',
    category: 'corporate_wear',
    description: 'Formal navy blue trousers for corporate settings',
    price: 1500,
    image: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    name: 'School Uniform Set',
    category: 'school_uniform',
    description: 'Complete school uniform set with shirt and pants/skirt',
    price: 1800,
    image: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    name: 'Sports Jersey',
    category: 'sports_wear',
    description: 'Breathable sports jersey for athletic activities',
    price: 900,
    image: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    name: 'Casual T-Shirt',
    category: 'casual_wear',
    description: 'Comfortable cotton t-shirt for casual occasions',
    price: 600,
    image: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Orders
const orders: Order[] = [
  {
    id: 'order-001',
    userId: 'oa-001',
    userType: 'org_admin',
    orgUserId: 'ou-001',
    status: 'processing',
    products: [
      {
        productId: 'prod-001',
        productName: 'Classic White Shirt',
        quantity: 2,
        price: 1200
      },
      {
        productId: 'prod-002',
        productName: 'Navy Blue Trousers',
        quantity: 2,
        price: 1500
      }
    ],
    totalAmount: 5400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'order-002',
    userId: 'ind-001',
    userType: 'individual',
    status: 'completed',
    products: [
      {
        productId: 'prod-005',
        productName: 'Casual T-Shirt',
        quantity: 3,
        price: 600
      }
    ],
    totalAmount: 1800,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Measurements
const measurements: Measurement[] = [
  {
    id: 'meas-001',
    userId: 'ou-001',
    userType: 'org_user',
    type: 'corporate_wear',
    sections: [
      {
        title: 'Upper Body',
        fields: [
          { name: 'Chest', value: '38', unit: 'inches' },
          { name: 'Shoulder', value: '16.5', unit: 'inches' },
          { name: 'Sleeve Length', value: '24', unit: 'inches' },
          { name: 'Neck', value: '15', unit: 'inches' }
        ]
      },
      {
        title: 'Lower Body',
        fields: [
          { name: 'Waist', value: '32', unit: 'inches' },
          { name: 'Hip', value: '38', unit: 'inches' },
          { name: 'Inseam', value: '30', unit: 'inches' },
          { name: 'Outseam', value: '40', unit: 'inches' }
        ]
      },
      {
        title: 'Accessories',
        fields: [
          { name: 'Head Size', value: '22', unit: 'inches' },
          { name: 'Glove Size', value: 'M', unit: '' },
          { name: 'Shoe Size', value: '9', unit: 'UK' },
          { name: 'Sock Size', value: 'M', unit: '' }
        ]
      },
      {
        title: 'Special Requirements',
        fields: [
          { name: 'Fabric Preference', value: 'Cotton', unit: '' },
          { name: 'Color Preference', value: 'Navy Blue', unit: '' },
          { name: 'Style Notes', value: 'Classic Cut', unit: '' },
          { name: 'Additional Info', value: 'None', unit: '' }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meas-002',
    userId: 'ind-001',
    userType: 'individual',
    type: 'casual_wear',
    sections: [
      {
        title: 'Upper Body',
        fields: [
          { name: 'Chest', value: '40', unit: 'inches' },
          { name: 'Shoulder', value: '17', unit: 'inches' },
          { name: 'Sleeve Length', value: '25', unit: 'inches' },
          { name: 'Neck', value: '15.5', unit: 'inches' }
        ]
      },
      {
        title: 'Lower Body',
        fields: [
          { name: 'Waist', value: '34', unit: 'inches' },
          { name: 'Hip', value: '40', unit: 'inches' },
          { name: 'Inseam', value: '31', unit: 'inches' },
          { name: 'Outseam', value: '41', unit: 'inches' }
        ]
      },
      {
        title: 'Fit Preferences',
        fields: [
          { name: 'Upper Fit', value: 'Regular', unit: '' },
          { name: 'Lower Fit', value: 'Slim', unit: '' },
          { name: 'Sleeve Preference', value: 'Full', unit: '' },
          { name: 'Length Preference', value: 'Standard', unit: '' }
        ]
      },
      {
        title: 'Special Requirements',
        fields: [
          { name: 'Fabric Preference', value: 'Cotton Blend', unit: '' },
          { name: 'Color Preference', value: 'Earth Tones', unit: '' },
          { name: 'Style Notes', value: 'Casual Modern', unit: '' },
          { name: 'Additional Info', value: 'None', unit: '' }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Passwords are stored in a separate object to simulate secure password handling
const userPasswords = {
  'sa-001': 'mk@admin',
  'oa-001': 'password123',
  'ou-001': 'employee123',
  'ou-002': 'employee456',
  'ind-001': 'password123',
  'ind-002': 'password456'
};

// Mock database export
export const mockDatabase = {
  superAdmins,
  organizations,
  orgAdmins,
  orgUsers,
  individuals,
  products,
  orders,
  measurements,
  userPasswords
};

// Helper functions to manage the mock database
export const getAllUsers = () => {
  return [
    ...mockDatabase.superAdmins,
    ...mockDatabase.orgAdmins,
    ...mockDatabase.individuals
  ];
};

export const findUserByEmail = (email: string) => {
  const allUsers = getAllUsers();
  return allUsers.find(user => user.email === email);
};

export const verifyPassword = (userId: string, password: string) => {
  return mockDatabase.userPasswords[userId as keyof typeof mockDatabase.userPasswords] === password;
};

export const getMeasurementTypes = (): MeasurementType[] => {
  return ['school_uniform', 'sports_wear', 'corporate_wear', 'casual_wear'];
};

export const getMeasurementSections = (type: MeasurementType) => {
  // For now, return the same sections for all types as per requirements
  return [
    {
      title: 'Upper Body',
      fields: [
        { name: 'Chest', value: '', unit: 'inches' },
        { name: 'Shoulder', value: '', unit: 'inches' },
        { name: 'Sleeve Length', value: '', unit: 'inches' },
        { name: 'Neck', value: '', unit: 'inches' }
      ]
    },
    {
      title: 'Lower Body',
      fields: [
        { name: 'Waist', value: '', unit: 'inches' },
        { name: 'Hip', value: '', unit: 'inches' },
        { name: 'Inseam', value: '', unit: 'inches' },
        { name: 'Outseam', value: '', unit: 'inches' }
      ]
    },
    {
      title: 'Fit Preferences',
      fields: [
        { name: 'Upper Fit', value: '', unit: '' },
        { name: 'Lower Fit', value: '', unit: '' },
        { name: 'Sleeve Preference', value: '', unit: '' },
        { name: 'Length Preference', value: '', unit: '' }
      ]
    },
    {
      title: 'Special Requirements',
      fields: [
        { name: 'Fabric Preference', value: '', unit: '' },
        { name: 'Color Preference', value: '', unit: '' },
        { name: 'Style Notes', value: '', unit: '' },
        { name: 'Additional Info', value: '', unit: '' }
      ]
    }
  ];
};

export const getMeasurementsByUser = (userId: string, userType: 'org_user' | 'individual') => {
  return mockDatabase.measurements.filter(m => m.userId === userId && m.userType === userType);
};

export const getOrdersByUser = (userId: string) => {
  return mockDatabase.orders.filter(o => o.userId === userId);
};

export const getProductsByCategory = (category: string) => {
  return mockDatabase.products.filter(p => p.category === category);
};

export const getOrganizationUsers = (orgId: string) => {
  return mockDatabase.orgUsers.filter(ou => ou.orgId === orgId);
};
