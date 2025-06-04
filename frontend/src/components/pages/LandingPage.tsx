import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../layout/Logo';
import LandingButtons from '../layout/LandingButtons';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/company/register');
  };
  const handleLogin = () => {
    navigate('/manager/login');
  };
  const handleManagerRegister = () => {
    navigate('/manager/register');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <Logo />
        <LandingButtons onRegisterClick={handleRegister} onLoginClick={handleLogin} onManagerRegisterClick={handleManagerRegister} />
      </div>
    </div>
  );
};

export default LandingPage; 