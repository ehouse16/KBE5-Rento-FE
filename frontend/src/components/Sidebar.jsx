import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "대시보드",
      icon: "fas fa-tachometer-alt",
      path: "/dashboard"
    },
    {
      id: "realtime-event",
      label: "실시간 관제",
      icon: "fas fa-bolt",
      path: "/realtime-event"
    },
    {
      id: "users",
      label: "사용자 관리",
      icon: "fas fa-user-cog",
      path: "/users"
    },
    {
      id: "vehicles",
      label: "차량 관리",
      icon: "fas fa-car",
      path: "/vehicles"
    },
    {
      id: "reservations",
      label: "예약 관리",
      icon: "fas fa-calendar-alt", 
      path: "/drives"
    }
  ];

  // 현재 경로에 따라 activeTab 초기화 - 의존성 배열 수정
  useEffect(() => {
    const currentMenuItem = menuItems.find(item => item.path === location.pathname);
    if (currentMenuItem && currentMenuItem.id !== activeTab) {
      setActiveTab(currentMenuItem.id);
    }
  }, [location.pathname, activeTab, setActiveTab]); // 의존성 배열에 필요한 모든 값 추가

  const handleMenuClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  // isActive 함수 수정 - location.pathname만 기준으로 판단
  const isActive = (item) => {
    return location.pathname === item.path;
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">메뉴</h3>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                isActive(item)
                  ? "bg-green-50 text-green-600 border-r-2 border-green-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <i className={`${item.icon} w-5 mr-3 text-sm`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* 하단 도움말 섹션 */}
      <div className="mb-4 mx-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-question-circle text-blue-500 mr-2"></i>
            <span className="text-sm font-medium text-blue-900">도움이 필요하신가요?</span>
          </div>
          <p className="text-xs text-blue-700 mb-3">
            사용 가이드를 확인하거나 고객지원팀에 문의하세요.
          </p>
          <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
            도움말 보기
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;