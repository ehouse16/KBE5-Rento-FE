import React from 'react';
import ManagerRegisterForm from '../manager/ManagerRegisterForm';
import { useNavigate } from 'react-router-dom';

const ManagerRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex-shrink-0 flex items-center">
            <div className="h-10 w-10 bg-green-500 rounded-md flex items-center justify-center text-white">
              <i className="fas fa-car-side"></i>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900">FleetPro</span>
            <span className="ml-2 text-sm text-gray-500">관리 서비스</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">매니저 회원가입</h2>
            <p className="text-gray-600">FleetPro 서비스 이용을 위한 매니저 회원가입</p>
          </div>
          <ManagerRegisterForm onSuccess={() => navigate('/dashboard')} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 FleetPro 관리 서비스. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ManagerRegisterPage; 