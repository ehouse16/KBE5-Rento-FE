import axios, { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
}

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
}; 