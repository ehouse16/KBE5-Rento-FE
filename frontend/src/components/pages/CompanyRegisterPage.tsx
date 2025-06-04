import React from 'react';
import CompanyRegisterForm from '../company/CompanyRegisterForm';
import { useNavigate } from 'react-router-dom';

const CompanyRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center">
              <i className="fas fa-building text-white"></i>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-800">업체관리</span>
          </div>
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
            <i className="fas fa-user"></i>
          </div>
        </div>
      </header>
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">업체 등록</h1>
          <p className="text-gray-600 mt-1">새로운 업체 정보를 입력해주세요</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">새 업체 등록</h2>
          <CompanyRegisterForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CompanyRegisterPage; 