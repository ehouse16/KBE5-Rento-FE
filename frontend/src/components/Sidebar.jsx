import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: "users" | "departments") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => (
  <aside className="w-64 bg-white shadow-sm h-[calc(100vh-64px)] border-r border-gray-200">
    <div className="p-4 text-sm font-medium text-gray-500">MAIN MENU</div>
    <nav className="mt-2">
      <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100">
        <i className="fas fa-tachometer-alt w-6 text-gray-500"></i>
        <span>대시보드</span>
      </a>
      <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100">
        <i className="fas fa-building w-6 text-gray-500"></i>
        <span>회사 관리</span>
      </a>
      <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100">
        <i className="fas fa-route w-6 text-gray-500"></i>
        <span>운행 관리</span>
      </a>
      <button
        className={`w-full text-left flex items-center px-4 py-3 ${
          activeTab === "users" || activeTab === "departments"
            ? "text-[#2ECC71] bg-[#ebfaf0]"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("users")}
      >
        <i className="fas fa-users w-6"></i>
        <span>사용자 & 부서</span>
      </button>
      <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100">
        <i className="fas fa-truck w-6 text-gray-500"></i>
        <span>차량 관리</span>
      </a>
      <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100">
        <i className="fas fa-calendar-alt w-6 text-gray-500"></i>
        <span>예약 관리</span>
      </a>
    </nav>
  </aside>
);

export default Sidebar;