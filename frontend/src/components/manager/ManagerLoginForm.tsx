import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const ManagerLoginForm: React.FC = () => {
  const [companyCode, setCompanyCode] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://api.rento.world/api/managers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyCode,
          loginId, 
          password 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Login response data:', data);

        // 토큰 추출 (대소문자 구분 없이)
        const accessToken = res.headers.get('accesstoken') || 
                          res.headers.get('AccessToken') || 
                          res.headers.get('ACCESSTOKEN');
        const refreshToken = res.headers.get('refreshtoken') || 
                           res.headers.get('RefreshToken') || 
                           res.headers.get('REFRESHTOKEN');

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        if (!accessToken || !refreshToken) {
          throw new Error('토큰이 서버 응답에 포함되지 않았습니다.');
        }

        // 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // 사용자 정보 저장
        localStorage.setItem('loginId', data.loginId);
        localStorage.setItem('companyCode', data.companyCode);
        localStorage.setItem('managerName', data.name);

        navigate('/dashboard');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">매니저 로그인</h2>
        <p className="text-gray-500 mt-2">업체 코드, 아이디, 비밀번호를 입력해 주세요</p>
      </div>
      <div>
        <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700 mb-1">
          업체 코드
        </label>
        <input
          id="companyCode"
          type="text"
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
          placeholder="업체 코드를 입력하세요"
          required
        />
      </div>
      <div>
        <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 mb-1">
          아이디
        </label>
        <input
          id="loginId"
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
          placeholder="아이디를 입력하세요"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 !rounded-button whitespace-nowrap cursor-pointer flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <>
            <i className="fas fa-circle-notch fa-spin mr-2"></i>
            로그인 중...
          </>
        ) : (
          '로그인'
        )}
      </button>
    </form>
  );
};

export default ManagerLoginForm;