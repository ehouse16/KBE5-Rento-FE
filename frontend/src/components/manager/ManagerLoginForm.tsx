import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const ManagerLoginForm: React.FC = () => {
  const [companyCode, setCompanyCode] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fcmTokenReady, setFcmTokenReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFCMToken = () => {
      const token = localStorage.getItem('fcmToken');
      if (token) {
        setFcmTokenReady(true);
        console.log('FCM token ready:', token);
      } else {
        setFcmTokenReady(false);
        console.log('FCM token not ready');
      }
    };

    // 초기 체크
    checkFCMToken();

    // FCM 토큰 업데이트 이벤트 리스너
    const handleFcmTokenUpdated = (event: CustomEvent) => {
      console.log('FCM token updated:', event.detail.token);
      setFcmTokenReady(true);
    };

    window.addEventListener('fcmTokenUpdated', handleFcmTokenUpdated as EventListener);

    // 주기적으로 FCM 토큰 상태 확인
    const tokenCheckInterval = setInterval(checkFCMToken, 1000);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('fcmTokenUpdated', handleFcmTokenUpdated as EventListener);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const waitForFCMToken = async (maxWaitTime = 10000): Promise<string | null> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const token = localStorage.getItem('fcmToken');
      if (token) {
        console.log('FCM token obtained:', token);
        return token;
      }
      
      // 100ms 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('FCM token wait timeout');
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      console.log('Starting login process...');
  
      // FCM 토큰 대기
      const fcmToken = await waitForFCMToken();
  
      const loginData: any = {
        companyCode,
        loginId,
        password
      };
  
      if (fcmToken) {
        loginData.fcmToken = fcmToken;
        console.log('FCM Token included in login request:', fcmToken);
      } else {
        console.log('No FCM Token available for login - proceeding without it');
      }
  
      const response = await axiosInstance.post('/api/managers/login', loginData);
  
      const accessToken = response.headers['accesstoken'] || response.headers['AccessToken'];
      const refreshToken = response.headers['refreshtoken'] || response.headers['RefreshToken'];
  
      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('loginId', response.data.loginId);
        localStorage.setItem('companyCode', response.data.companyCode);
  
        // ✅ managerId 저장
        if (response.data.id) {
          localStorage.setItem('managerId', response.data.id.toString());
        }
  
        // ✅ FCM 토큰도 다시 저장!
        if (fcmToken) {
          localStorage.setItem('fcmToken', fcmToken);
          console.log('FCM Token saved to localStorage again:', fcmToken);
        }
  
        // 플래그 제거
        localStorage.removeItem('fcmTokenChanged');
  
        console.log('Login successful');
  
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        throw new Error('인증 토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('로그인 정보가 올바르지 않습니다.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">매니저 로그인</h2>
        <p className="text-gray-500 mt-2">업체 코드, 아이디, 비밀번호를 입력해 주세요</p>
        {/* FCM 토큰 상태 표시 (개발용) */}
        <div className="mt-2 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${fcmTokenReady ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="text-gray-400">
            {fcmTokenReady ? '알림 준비됨' : '알림 설정 중...'}
          </span>
        </div>
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