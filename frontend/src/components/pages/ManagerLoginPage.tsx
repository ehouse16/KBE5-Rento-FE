import React from 'react';
import ManagerLoginForm from '../manager/ManagerLoginForm';

const ManagerLoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-600 mb-2">비즈니스 포털</h1>
          <p className="text-gray-600">안전하고 편리한 비즈니스 관리 시스템</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8 transition-all duration-300">
          <ManagerLoginForm />
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage; 