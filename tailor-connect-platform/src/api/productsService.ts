
import { apiRequest, endpoints } from './apiConfig';

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
  updated_at: string;
  category_name: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  id?: string;
}

export const productsService = {
  getAllCategories: async (): Promise<{ success: boolean; categories: ProductCategory[] }> => {
    return apiRequest<{ success: boolean; categories: ProductCategory[] }>(
      endpoints.products.categories.getAll
    );
  },
  
  createCategory: async (name: string, description?: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.products.categories.create,
      'POST',
      { name, description }
    );
  },
  
  getAllProducts: async (): Promise<{ success: boolean; products: Product[] }> => {
    return apiRequest<{ success: boolean; products: Product[] }>(
      endpoints.products.getAll
    );
  },
  
  getProductById: async (id: string): Promise<{ success: boolean; product: Product }> => {
    return apiRequest<{ success: boolean; product: Product }>(
      endpoints.products.getById(id)
    );
  },
  
  getProductsByCategory: async (categoryId: string): Promise<{ success: boolean; products: Product[] }> => {
    return apiRequest<{ success: boolean; products: Product[] }>(
      endpoints.products.getByCategory(categoryId)
    );
  },
  
  createProduct: async (
    name: string,
    categoryId: string,
    price: number,
    description?: string,
    image?: string
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.products.create,
      'POST',
      { name, category_id: categoryId, price, description, image }
    );
  },
  
  updateProduct: async (
    id: string,
    data: {
      name?: string;
      category_id?: string;
      description?: string;
      price?: number;
      image?: string;
    }
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.products.update(id),
      'PUT',
      data
    );
  },
  
  deleteProduct: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.products.delete(id),
      'DELETE'
    );
  },
};
