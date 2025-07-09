
import { apiRequest, endpoints } from './apiConfig';

export interface MeasurementType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface MeasurementField {
  id: string;
  section_id: string;
  name: string;
  description: string;
  unit: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MeasurementSection {
  id: string;
  measurement_type_id: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  fields: MeasurementField[];
}

export interface MeasurementValue {
  id?: string;
  field_id: string;
  field_name?: string;
  unit?: string;
  section_title?: string;
  value: string;
}

export interface MeasurementDetail {
  id: string;
  user_id: string;
  user_type: string;
  type_id: string;
  type_name: string;
  created_at: string;
  updated_at: string;
  sections: {
    id: string;
    title: string;
    values: MeasurementValue[];
  }[];
}

export interface MeasurementSummary {
  id: string;
  type_id: string;
  type_name: string;
  created_at: string;
  updated_at: string;
  values: MeasurementValue[];
}

export interface MeasurementListItem {
  id: string;
  user_id: string;
  user_type: string;
  measurement_type_id: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  measurement_type: string;
  measurement_type_name?: string;
}

export const measurementsService = {
  getAllTypes: async (): Promise<{ success: boolean; types: MeasurementType[] }> => {
    return apiRequest<{ success: boolean; types: MeasurementType[] }>(
      endpoints.measurements.types.getAll
    );
  },
  
  createType: async (name: string, description?: string): Promise<{ success: boolean; id: string; message: string }> => {
    return apiRequest<{ success: boolean; id: string; message: string }>(
      endpoints.measurements.types.create,
      'POST',
      { name, description }
    );
  },
  
  getSectionsByType: async (typeId: string): Promise<{ success: boolean; sections: MeasurementSection[] }> => {
    return apiRequest<{ success: boolean; sections: MeasurementSection[] }>(
      endpoints.measurements.types.getSections(typeId)
    );
  },
  
  getUserMeasurements: async (userId: string, userType: string): Promise<{ success: boolean; measurements: MeasurementSummary[] }> => {
    return apiRequest<{ success: boolean; measurements: MeasurementSummary[] }>(
      endpoints.measurements.getByUser(userId, userType)
    );
  },
  
  getOrgMeasurements: async (orgId: string): Promise<{ success: boolean; measurements: MeasurementListItem[] }> => {
    return apiRequest<{ success: boolean; measurements: MeasurementListItem[] }>(
      endpoints.measurements.getByOrg(orgId)
    );
  },
  
  getMeasurementById: async (id: string): Promise<{ success: boolean; measurement: MeasurementDetail }> => {
    return apiRequest<{ success: boolean; measurement: MeasurementDetail }>(
      endpoints.measurements.getById(id)
    );
  },
  
  createMeasurement: async (
    userId: string,
    userType: string,
    measurementTypeId: string,
    values: { field_id: string; value: string }[]
  ): Promise<{ success: boolean; id: string; message: string }> => {
    return apiRequest<{ success: boolean; id: string; message: string }>(
      endpoints.measurements.create,
      'POST',
      { user_id: userId, user_type: userType, measurement_type_id: measurementTypeId, values }
    );
  },
  
  updateMeasurement: async (
    id: string,
    values: { id?: string; field_id?: string; value: string }[]
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      endpoints.measurements.update(id),
      'PUT',
      { values }
    );
  },
  
  deleteMeasurement: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      endpoints.measurements.delete(id),
      'DELETE'
    );
  },
  
  getAllMeasurements: async (): Promise<{ success: boolean; measurements: MeasurementListItem[] }> => {
    return apiRequest<{ success: boolean; measurements: MeasurementListItem[] }>(
      endpoints.measurements.getAll
    );
  },
};
