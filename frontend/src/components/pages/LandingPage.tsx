import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../layout/Logo';
import LandingButtons from '../layout/LandingButtons';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [managerName, setManagerName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('loginId');
    setManagerName(name);
  }, []);

  const handleRegister = () => {
    navigate('/company/register');
  };
  
  const handleLogin = () => {
    navigate('/manager/login');
  };
  
  const handleManagerRegister = () => {
    navigate('/manager/register');
  };
  
  const handleLogout = async () => {
    // 토큰 키를 일관되게 수정 (대소문자 주의)
    const accessToken = localStorage.getItem('AccessToken') || localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('RefreshToken') || localStorage.getItem('refreshToken');
    
    console.log('AccessToken:', accessToken); // 디버깅용
    console.log('RefreshToken:', refreshToken); // 디버깅용
    
    if (!accessToken) {
      alert('인증 토큰이 없습니다. 다시 로그인해 주세요.');
      localStorage.clear();
      navigate('/manager/login');
      return;
    }
    
    try {
      const response = await fetch('/api/managers/logout', {
        method: 'POST',
        headers: {
          'AccessToken': accessToken,        // JwtFilter에서 찾는 헤더명과 일치
          'RefreshToken': refreshToken || "",
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('로그아웃 실패 응답:', errorData);
        throw new Error(`로그아웃 실패: ${response.status}`);
      }
  
      // 성공적으로 로그아웃되었을 때 로컬 스토리지 비우기
      localStorage.clear(); // 모든 토큰 정보 삭제
      setManagerName(null);
      navigate('/manager/login');
      
    } catch (error) {
      console.error('로그아웃 실패:', error);
      
      // 토큰이 만료되었거나 유효하지 않은 경우에도 로컬 스토리지 정리
      localStorage.clear();
      setManagerName(null);
      navigate('/manager/login');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* 왼쪽 상단 환영 메시지 */}
      <div className="absolute top-4 left-4 z-10">
        {managerName ? (
          <div className="text-green-600 font-semibold text-lg">
            {managerName}님, 환영합니다!
            <button
              onClick={handleLogout}
              className="ml-3 text-sm text-red-500 underline hover:text-red-700"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            로그인 후 서비스를 이용해 주세요.
          </div>
        )}
      </div>

      {/* 원래 있던 내용 유지 */}
      <div className="w-full max-w-md flex flex-col items-center">
        <Logo />
        <LandingButtons
          onRegisterClick={handleRegister}
          onLoginClick={handleLogin}
          onManagerRegisterClick={handleManagerRegister}
        />
      </div>
    </div>
  );
};

export default LandingPage;