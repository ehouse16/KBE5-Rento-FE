import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../../contexts/CompanyContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://api.rento.world/api/managers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId: formData.loginId, password: formData.password }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('로그인에 실패했습니다.');
      }

      const data = await response.json();
      console.log('Login response:', data);

      // 토큰 추출 (서버 응답 형식에 맞춤)
      const accessToken = response.headers.get('AccessToken');
      const refreshToken = response.headers.get('RefreshToken');

      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Tokens from response:', { accessToken, refreshToken });

      if (!accessToken || !refreshToken) {
        throw new Error('인증 토큰을 받지 못했습니다.');
      }

      // 토큰 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('loginId', data.loginId);
      localStorage.setItem('companyCode', data.companyCode);

      console.log('Stored data:', {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        loginId: localStorage.getItem('loginId'),
        companyCode: localStorage.getItem('companyCode')
      });

      setCompanyCode(data.companyCode);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-600 mb-2">비즈니스 포털</h1>
          <p className="text-gray-600">안전하고 편리한 비즈니스 관리 시스템</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
                아이디
              </label>
              <input
                type="text"
                id="loginId"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">
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
    </div>
  );
};

export default ManagerLoginPage; 