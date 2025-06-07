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

export interface DepartmentUpdateRequest extends DepartmentRegisterRequest {
  departmentId: number;
}

export const getDepartments = async (companyCode: string) => {
  const response = await axiosInstance.get(`/departments?companyCode=${companyCode}`);
  return response.data;
};

export const registerDepartment = async (data: DepartmentRegisterRequest) => {
  const response = await axiosInstance.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (id: number, data: DepartmentUpdateRequest) => {
  const response = await axiosInstance.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: number) => {
  const response = await axiosInstance.delete(`/departments/${id}`);
  return response.data;
}; 