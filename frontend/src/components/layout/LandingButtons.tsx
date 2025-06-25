import React from 'react';

interface LandingButtonsProps {
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
  onManagerRegisterClick?: () => void;
}

const LandingButtons: React.FC<LandingButtonsProps> = ({
  onRegisterClick,
  onLoginClick,
  onManagerRegisterClick,
}) => (
  <div className="w-full space-y-4">
    {/* <button
      className="w-full py-4 bg-green-500 text-white font-medium rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out !rounded-button whitespace-nowrap cursor-pointer"
      onClick={onRegisterClick}
    >
      업체 등록
    </button> */}
    <button
      className="w-full py-4 bg-white text-green-600 font-medium rounded-lg shadow-md border border-green-500 hover:bg-green-50 transition duration-300 ease-in-out !rounded-button whitespace-nowrap cursor-pointer"
      onClick={onLoginClick}
    >
      매니저 로그인
    </button>
    {/* <button
      className="w-full py-4 bg-green-500 text-white font-medium rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out !rounded-button whitespace-nowrap cursor-pointer"
      onClick={onManagerRegisterClick}
    >
      매니저 회원가입
    </button> */}
  </div>
);

export default LandingButtons; 