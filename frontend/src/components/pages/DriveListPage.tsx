import React, { useEffect, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import DriveList from "../drive/DriveList";
import DriveRegisterModal from "../drive/DriveRegisterModal";
import axiosInstance from '../../utils/axios';

// DriveListPage 내부에서 사용할 간소화된 Drive 인터페이스 정의
interface Drive {
  id: number;
  memberName: string;
  vehicleNumber: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  isStart: boolean;
}

const DriveListPage: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("전체 상태");
  const [sort, setSort] = useState("날짜순");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchDrives = async () => {
      console.log("운행 목록 useEffect 실행됨");
      try {
        const res = await axiosInstance.get("/api/drives");
        console.log("운행 목록 API 응답:", res.data);
        const data = res.data;
        setDrives(
          (Array.isArray(data.data) ? data.data : []).map((d: any) => ({
            id: d.id,
            memberName: d.memberName || "알 수 없음",
            vehicleNumber: d.vehicleNumber || "알 수 없음",
            startDate: d.startDate ? d.startDate.replace("T", " ").slice(0, 16) : "",
            endDate: d.endDate ? d.endDate.replace("T", " ").slice(0, 16) : "",
            startLocation: d.startLocation || "알 수 없음",
            endLocation: d.endLocation || "알 수 없음",
            isStart: d.isStart,
          }))
        );
        setTotalElements(Number.isNaN(Number(data.data?.totalElements)) ? 0 : Number(data.data?.totalElements));
      } catch (e) {
        setError('운행 목록을 불러오지 못했습니다.');
        console.error("운행 목록 에러:", e);
      }
    };
    fetchDrives();
  }, []);

  const filteredDrives = drives
    .filter((d) =>
      d.memberName.includes(search) || d.vehicleNumber.includes(search)
    )
    .filter((d) =>
      status === "전체 상태"
        ? true
        : status === "운행 중"
        ? d.isStart
        : !d.isStart
    )
    .sort((a, b) => {
      if (sort === "날짜순") return a.startDate.localeCompare(b.startDate);
      if (sort === "이름순") return a.memberName.localeCompare(b.memberName);
      if (sort === "차량번호순") return a.vehicleNumber.localeCompare(b.vehicleNumber);
      return 0;
    });

  console.log("filteredDrives:", filteredDrives);

  const handleRegisterSuccess = () => {
    setRegisterOpen(false);
    const fetchDrives = async () => {
      try {
        const res = await axiosInstance.get("/api/drives");
        console.log("운행 목록 API 응답(등록 후):", res.data);
        const data = res.data;
        setDrives(
          (Array.isArray(data.data) ? data.data : []).map((d: any) => ({
            id: d.id,
            memberName: d.memberName || "알 수 없음",
            vehicleNumber: d.vehicleNumber || "알 수 없음",
            startDate: d.startDate ? d.startDate.replace("T", " ").slice(0, 16) : "",
            endDate: d.endDate ? d.endDate.replace("T", " ").slice(0, 16) : "",
            startLocation: d.startLocation || "알 수 없음",
            endLocation: d.endLocation || "알 수 없음",
            isStart: d.isStart,
          }))
        );
        setTotalElements(Number.isNaN(Number(data.data?.totalElements)) ? 0 : Number(data.data?.totalElements));
      } catch (e) {
        setError('운행 목록을 불러오지 못했습니다.');
        console.error("운행 목록 에러(등록 후):", e);
      }
    };
    fetchDrives();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  console.log("DriveList drives props:", drives);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab="drives" setActiveTab={() => {}} />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">운행 예약 목록</h1>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out !rounded-button whitespace-nowrap cursor-pointer" onClick={() => setRegisterOpen(true)}>
                <i className="fas fa-plus mr-2"></i>새 예약
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-grow max-w-xs">
                  <input
                    type="text"
                    placeholder="이름 또는 차량번호 검색"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm cursor-pointer"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option>전체 상태</option>
                    <option>운행 중</option>
                    <option>예약됨</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm cursor-pointer"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option>날짜순</option>
                    <option>이름순</option>
                    <option>차량번호순</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                  </div>
                </div>
              </div>
            </div>

            <DriveList drives={filteredDrives} />

            <div className="mt-8 flex justify-center">
              <nav className="flex items-center">
                <button className="px-3 py-1 rounded-md mr-1 text-gray-500 hover:bg-gray-100 !rounded-button whitespace-nowrap cursor-pointer">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button className="px-3 py-1 rounded-md mx-1 bg-green-500 text-white !rounded-button whitespace-nowrap cursor-pointer">
                  1
                </button>
                <button className="px-3 py-1 rounded-md mx-1 text-gray-700 hover:bg-gray-100 !rounded-button whitespace-nowrap cursor-pointer">
                  2
                </button>
                <button className="px-3 py-1 rounded-md mx-1 text-gray-700 hover:bg-gray-100 !rounded-button whitespace-nowrap cursor-pointer">
                  3
                </button>
                <button className="px-3 py-1 rounded-md ml-1 text-gray-500 hover:bg-gray-100 !rounded-button whitespace-nowrap cursor-pointer">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <DriveRegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default DriveListPage; 