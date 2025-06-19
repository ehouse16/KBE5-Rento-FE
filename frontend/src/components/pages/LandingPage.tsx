import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import axiosInstance from "../../utils/axios";

const LandingPage = () => {
  const navigate = useNavigate();
  const { companyCode } = useCompany();
  const [managerName, setManagerName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 매니저 이름 가져오기
    const storedManagerName = localStorage.getItem("managerName");
    if (storedManagerName) {
      setManagerName(storedManagerName);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      console.log("Logout attempt - Tokens:", { accessToken, refreshToken });

      if (!accessToken || !refreshToken) {
        console.log("No tokens found, clearing storage and redirecting");
        localStorage.clear();
        navigate("/manager-login");
        return;
      }

      await axiosInstance.post("/api/managers/logout");

      localStorage.clear();
      navigate("/manager-login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/manager-login");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* 왼쪽 상단 환영 메시지 */}
      <div className="absolute top-4 left-4 z-10">
        {isLoggedIn ? (
          <div className="text-green-600 font-semibold text-lg">
            {localStorage.getItem('loginId')}님, 환영합니다!
            <button
              onClick={handleLogout}
              className="ml-3 text-sm text-red-500 underline hover:text-red-700 transition-colors"
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

      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-500">RENTO</h1>
        </div>
        <div className="space-y-4 w-full">
          <button
            onClick={() => navigate("/company-register")}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            회사 등록
          </button>
          <button
            onClick={() => navigate("/manager-register")}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            매니저 등록
          </button>
          {!isLoggedIn && (
            <button
              onClick={() => navigate("/manager-login")}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              매니저 로그인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;