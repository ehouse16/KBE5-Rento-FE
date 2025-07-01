import React, { useEffect, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import DriveList from "../drive/DriveList";
import DriveRegisterModal from "../drive/DriveRegisterModal";
import axiosInstance from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

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
  status?: "READY" | "DRIVING" | "COMPLETED";
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
  const [statusTab, setStatusTab] = useState<'COMPLETED' | 'DRIVING' | 'READY'>('COMPLETED');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchDrives = async (page = 0) => {
    setLoading(true);
    try {
      // API 호출 시 페이지 번호와 정렬, 검색 조건 등을 파라미터로 전달해야 합니다. (백엔드 구현에 따라 달라짐)
      const res = await axiosInstance.get(`/api/drives?page=${page}`);
      const pageData = res.data.data || {}; // API 응답 구조에 따라 조정

      setDrives(
        (Array.isArray(pageData.content) ? pageData.content : []).map((d: any) => ({
          id: d.id,
          memberName: d.memberName || "알 수 없음",
          vehicleNumber: d.vehicleNumber || "알 수 없음",
          startDate: d.startDate ? d.startDate.replace("T", " ").slice(0, 16) : "",
          endDate: d.endDate ? d.endDate.replace("T", " ").slice(0, 16) : "",
          startLocation: d.startLocation || "알 수 없음",
          endLocation: d.endLocation || "알 수 없음",
          isStart: d.isStart,
          status: d.status as "READY" | "DRIVING" | "COMPLETED" | undefined,
        }))
      );
      setTotalElements(pageData.totalElements || 0);
      setTotalPages(pageData.totalPages || 0);
      setCurrentPage(pageData.number || 0);
    } catch (e) {
      setError('운행 목록을 불러오지 못했습니다.');
      console.error("운행 목록 에러:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusLabel = (status: 'COMPLETED' | 'DRIVING' | 'READY') => {
    switch (status) {
      case 'COMPLETED': return '운행 완료';
      case 'DRIVING': return '운행 중';
      case 'READY': return '운행 전';
      default: return '';
    }
  };

  const filteredDrivesByStatus = drives.filter((d: any) => {
    if (statusTab === 'COMPLETED') return d.status === 'COMPLETED';
    if (statusTab === 'DRIVING') return d.status === 'DRIVING';
    if (statusTab === 'READY') return d.status === 'READY';
    return true;
  });

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

  const handleRegisterSuccess = (message: string) => {
    setRegisterOpen(false);
    alert(message); // 서버에서 받은 성공 메시지 표시
    fetchDrives(0); // 등록 성공 시 0페이지로 이동
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

  // 관제 이동 핸들러
  const handleGoToRealtime = (driveId: number) => {
    navigate(`/realtime-event?driveId=${driveId}`);
  };

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

            <div className="flex gap-2 mb-6">
              {(['COMPLETED', 'DRIVING', 'READY'] as const).map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${statusTab === tab ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setStatusTab(tab)}
                >
                  {getStatusLabel(tab)}
                </button>
              ))}
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
              </div>
            </div>

            <DriveList drives={filteredDrivesByStatus} renderExtra={(drive) => (
              <button
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                onClick={e => { e.stopPropagation(); handleGoToRealtime(drive.id); }}
              >
                관제
              </button>
            )} />

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded-md mr-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-1 rounded-md mx-1 ${currentPage === i ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'} !rounded-button whitespace-nowrap cursor-pointer`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1 rounded-md ml-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <DriveRegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default DriveListPage; 