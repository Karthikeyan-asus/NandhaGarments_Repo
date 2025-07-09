
import { apiRequest, endpoints } from './apiConfig';

// Response and request interfaces
export interface SuperAdminResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface OrgAdminResponse {
  id: string;
  org_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  org_name?: string;
}

export interface OrgUserResponse {
  id: string;
  org_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  age: number;
  department: string;
  created_at: string;
  updated_at: string;
  org_name?: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  logo?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  id?: string;
}

export const usersService = {
  // Super Admin
  createSuperAdmin: async (name: string, email: string, password: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.superAdmin.create,
      'POST',
      { name, email, password }
    );
  },
  
  updateSuperAdmin: async (id: string, data: { name?: string; email?: string; password?: string }): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.superAdmin.update(id),
      'PUT',
      data
    );
  },
  
  deleteSuperAdmin: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.superAdmin.delete(id),
      'DELETE'
    );
  },
  
  getAllSuperAdmins: async (): Promise<{ success: boolean; admins: SuperAdminResponse[] }> => {
    return apiRequest<{ success: boolean; admins: SuperAdminResponse[] }>(
      endpoints.users.superAdmin.getAll
    );
  },
  
  // Organization
  createOrganization: async (
    name: string,
    pan: string,
    email: string,
    phone: string,
    address: string,
    gstin: string,
    createdBy: string,
    logo?: string,
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.organization.create,
      'POST',
      { name, pan, email, phone, address, gstin, created_by: createdBy, logo }
    );
  },
  
  // Organization Admin
  createOrgAdmin: async (
    orgId: string,
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.orgAdmin.create,
      'POST',
      { org_id: orgId, name, email, password }
    );
  },
  
  updateOrgAdmin: async (
    id: string,
    data: { org_id?: string; name?: string; email?: string; password?: string }
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.orgAdmin.update(id),
      'PUT',
      data
    );
  },
  
  deleteOrgAdmin: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.orgAdmin.delete(id),
      'DELETE'
    );
  },
  
  getAllOrgAdmins: async (): Promise<{ success: boolean; admins: OrgAdminResponse[] }> => {
    return apiRequest<{ success: boolean; admins: OrgAdminResponse[] }>(
      endpoints.users.orgAdmin.getAll
    );
  },
  
  getOrgAdminsByOrg: async (orgId: string): Promise<{ success: boolean; admins: OrgAdminResponse[] }> => {
    return apiRequest<{ success: boolean; admins: OrgAdminResponse[] }>(
      endpoints.users.orgAdmin.getByOrg(orgId)
    );
  },
  
  // Organization Users
  createOrgUser: async (
    orgId: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    createdBy: string,
    age?: number,
    department?: string,
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.orgUser.create,
      'POST',
      { org_id: orgId, name, email, phone, address, created_by: createdBy, age, department }
    );
  },
  
  updateOrgUser: async (
    id: string,
    data: {
      org_id?: string;
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      age?: number;
      department?: string;
    }
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.orgUser.update(id),
      'PUT',
      data
    );
  },
  
  deleteOrgUser: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.orgUser.delete(id),
      'DELETE'
    );
  },
  
  getAllOrgUsers: async (): Promise<{ success: boolean; users: OrgUserResponse[] }> => {
    return apiRequest<{ success: boolean; users: OrgUserResponse[] }>(
      endpoints.users.orgUser.getAll
    );
  },
  
  getOrgUsersByOrg: async (orgId: string): Promise<{ success: boolean; users: OrgUserResponse[] }> => {
    return apiRequest<{ success: boolean; users: OrgUserResponse[] }>(
      endpoints.users.orgUser.getByOrg(orgId)
    );
  },
  
  // Individual Users
  createIndividual: async (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    age?: number
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(
      endpoints.users.individual.create,
      'POST',
      { name, email, password, phone, address, age }
    );
  },
};
