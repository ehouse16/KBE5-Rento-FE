import axiosInstance from '../utils/axios';

export interface Department {
  departmentId: number;
  departmentName: string;
  numberOfEmployees: number;
}

export interface DepartmentRegisterRequest {
  companyCode: string;
  departmentName: string;
}

export interface DepartmentUpdateRequest {
  departmentId: number;
  departmentName: string;
  companyCode: string;
}

export const getDepartments = async (companyCode: string) => {
  const response = await axiosInstance.get(`http://api.rento.world/api/departments?companyCode=${companyCode}`);
  return response.data;
};

export const registerDepartment = async (data: DepartmentRegisterRequest) => {
  const response = await axiosInstance.post(`http://api.rento.world/api/departments`, data);
  return response.data;
};

export const updateDepartment = async (data: DepartmentUpdateRequest) => {
  const response = await axiosInstance.put(`http://api.rento.world/api/departments/${data.departmentId}`, data);
  return response.data;
};

export const deleteDepartment = async (companyCode: string, departmentId: number) => {
  const response = await axiosInstance.delete(`http://api.rento.world/api/departments/${departmentId}?companyCode=${companyCode}`);
  return response.data;
}; 