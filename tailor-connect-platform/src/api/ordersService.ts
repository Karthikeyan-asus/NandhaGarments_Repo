
import { apiRequest, endpoints } from './apiConfig';

export interface Order {
  id: string;
  user_id: string;
  user_type: string;
  org_user_id?: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  products?: OrderProduct[];
  user_name?: string;
  org_name?: string;
  org_user_name?: string;
}

export interface OrderProduct {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  order_id?: string;
}

export const ordersService = {
  createOrder: async (
    userId: string,
    userType: string,
    products: { product_id: string, quantity: number }[],
    totalAmount: number,
    orgUserId?: string
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.orders.create,
      'POST',
      { user_id: userId, user_type: userType, org_user_id: orgUserId, products, total_amount: totalAmount }
    );
  },
  
  getOrderById: async (id: string): Promise<{ success: boolean; order: Order }> => {
    return apiRequest<{ success: boolean; order: Order }>(
      endpoints.orders.getById(id)
    );
  },
  
  getAllOrders: async (): Promise<{ success: boolean; orders: Order[] }> => {
    return apiRequest<{ success: boolean; orders: Order[] }>(
      endpoints.orders.getAll
    );
  },
  
  getOrdersByUser: async (userId: string, userType: string): Promise<{ success: boolean; orders: Order[] }> => {
    return apiRequest<{ success: boolean; orders: Order[] }>(
      endpoints.orders.getByUser(userId, userType)
    );
  },
  
  getOrdersByOrg: async (orgId: string): Promise<{ success: boolean; orders: Order[] }> => {
    return apiRequest<{ success: boolean; orders: Order[] }>(
      endpoints.orders.getByOrg(orgId)
    );
  },
  
  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.orders.updateStatus(id),
      'PUT',
      { status }
    );
  },
};
