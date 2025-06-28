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

export const getMembers = async ({ position, departmentId, keyword, page, size }: {
  position?: string;
  departmentId?: number;
  keyword?: string;
  page?: number;
  size?: number;
} = {}) => {
  let url = `/api/members?`;
  const params = [];
  if (position) params.push(`position=${encodeURIComponent(position)}`);
  if (departmentId) params.push(`departmentId=${departmentId}`);
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (typeof page === 'number') params.push(`page=${page}`);
  if (typeof size === 'number') params.push(`size=${size}`);
  if (params.length > 0) url += params.join('&');
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