import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';import Logo from '../layout/Logo';
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
  const handleLogout = () => {
    localStorage.removeItem('loginId');
    localStorage.removeItem('token');
    setManagerName(null);
    navigate('/manager/login');
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
              className="ml-3 text-sm text-red-500 underline"
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