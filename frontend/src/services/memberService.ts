import axiosInstance from '../utils/axios';

export interface Member {
  id: number;
  name: string;
  email: string;
  position: string;
  login_id: string;
  phoneNumber: string;
  departmentId: number;
  departmentName: string;
}

export interface MemberRegisterRequest {
  name: string;
  email: string;
  position: string;
  loginId: string;
  password: string;
  phoneNumber: string;
  departmentId: number;
  companyCode: string;
}

export interface MemberUpdateRequest extends Omit<MemberRegisterRequest, 'password'> {
  id: number;
}

export const getMembers = async (companyCode: string, page?: number, size?: number) => {
  let url = `/api/members?companyCode=${companyCode}`;
  if (typeof page === 'number') url += `&page=${page}`;
  if (typeof size === 'number') url += `&size=${size}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getMember = async (id: number) => {
  const response = await axiosInstance.get(`/api/members/${id}`);
  return response.data;
};

export const registerMember = async (data: MemberRegisterRequest) => {
  const response = await axiosInstance.post('/api/members', data);
  return response.data;
};

export const updateMember = async (id: number, data: MemberUpdateRequest) => {
  const response = await axiosInstance.put(`/api/members/${id}`, data);
  return response.data;
};

export const deleteMember = async (id: number) => {
  const response = await axiosInstance.delete(`/api/members/${id}`);
  return response.data;
};

export const getPositions = async () => {
  const response = await axiosInstance.get('/api/members/positions');
  return response.data;
}; 