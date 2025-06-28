import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../../contexts/CompanyContext';
import axiosInstance from '../../utils/axios';

interface LoginResponse {
  loginId: string;
  name: string;
  phone: string;
  email: string;
  companyCode: string;
  companyId: number;
}

const ManagerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCompanyCode } = useCompany();
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // FCM 토큰을 서버에 전송하는 함수
  const sendFcmToken = async () => {
    try {
      const fcmToken = sessionStorage.getItem('fcmToken');
      if (fcmToken) {
        await axiosInstance.patch('/api/managers/fcm-token', {
          token: fcmToken
        });
        console.log('FCM token sent to server successfully');
      }
    } catch (error) {
      console.error('Failed to send FCM token:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/managers/login', {
        loginId: formData.loginId,
        password: formData.password
      });

      const accessToken = response.headers['accesstoken'] || response.headers['AccessToken'];
      const refreshToken = response.headers['refreshtoken'] || response.headers['RefreshToken'];

      if (!accessToken || !refreshToken) {
        throw new Error('인증 토큰을 받지 못했습니다.');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('loginId', response.data.loginId);
      localStorage.setItem('companyCode', response.data.companyCode);

      if (setCompanyCode) {
        setCompanyCode(response.data.companyCode);
      }

      // 로그인 성공 후 FCM 토큰 전송
      await sendFcmToken();

      navigate('/dashboard');
    } catch (error) {
      setError('로그인에 실패했습니다.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">매니저 로그인</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="loginId" className="sr-only">아이디</label>
              <input
                id="loginId"
                name="loginId"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="아이디"
                value={formData.loginId}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagerLoginPage; 