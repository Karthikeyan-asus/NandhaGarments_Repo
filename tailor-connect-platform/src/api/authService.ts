
import { apiRequest, endpoints } from './apiConfig';

export interface LoginResponse {
  success: boolean;
  admin?: {
    id: string;
    name: string;
    email: string;
    org_id?: string;
    org_name?: string;
    is_first_login: boolean;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  token?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const authService = {
  loginSuperAdmin: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(
      endpoints.auth.loginSuperAdmin,
      'POST',
      { email, password }
    );
  },
  
  loginOrgAdmin: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(
      endpoints.auth.loginOrgAdmin,
      'POST',
      { email, password }
    );
  },
  
  loginIndividual: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(
      endpoints.auth.loginIndividual,
      'POST',
      { email, password }
    );
  },
  
  resetPassword: async (userType: string, email: string, newPassword: string): Promise<ResetPasswordResponse> => {
    return apiRequest<ResetPasswordResponse>(
      endpoints.auth.resetPassword,
      'POST',
      { user_type: userType, email, new_password: newPassword }
    );
  },
};
