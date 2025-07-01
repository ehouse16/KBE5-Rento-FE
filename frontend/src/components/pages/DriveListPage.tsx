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
  const [statusTab, setStatusTab] = useState<'READY' | 'DRIVING' | 'COMPLETED'>('READY');
  const [readyCount, setReadyCount] = useState(0);
  const [drivingCount, setDrivingCount] = useState(0);
  const navigate = useNavigate();

  // 운행 목록 및 통계 동기화 함수
  const fetchDrivesAndStats = async () => {
    try {
      const res = await axiosInstance.get("/api/drives");
      const data = res.data;
      const drivesArr = Array.isArray(data.data?.content) ? data.data.content.map((d: any) => ({
        id: d.id,
        memberName: d.memberName || "알 수 없음",
        vehicleNumber: d.vehicleNumber || "알 수 없음",
        startDate: d.startDate ? d.startDate.replace("T", " ").slice(0, 16) : "",
        endDate: d.endDate ? d.endDate.replace("T", " ").slice(0, 16) : "",
        startLocation: d.startLocation || "알 수 없음",
        endLocation: d.endLocation || "알 수 없음",
        isStart: d.isStart,
        status: d.status as "READY" | "DRIVING" | "COMPLETED" | undefined,
      })) : [];
      setDrives(drivesArr);
      setTotalElements(Number.isNaN(Number(data.data?.page?.totalElements)) ? 0 : Number(data.data?.page?.totalElements));
      setReadyCount(drivesArr.filter((d: any) => d.status === 'READY').length);
      setDrivingCount(drivesArr.filter((d: any) => d.status === 'DRIVING').length);
    } catch (e) {
      setError('운행 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchDrivesAndStats();
  }, []);

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

  // 운행 등록 성공 시 목록+통계 새로고침
  const handleRegisterSuccess = (message: string) => {
    alert(message || "운행이 성공적으로 예약되었습니다.");
    setRegisterOpen(false);
    fetchDrivesAndStats();
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

  // 운행 취소(삭제) 함수
  const handleCancelDrive = async (driveId: number) => {
    if (!window.confirm("정말로 이 운행을 취소하시겠습니까?")) return;
    try {
      const res = await axiosInstance.delete(`/api/drives/cancel/${driveId}`);
      alert(res.data?.message || "운행이 취소되었습니다");
      await fetchDrivesAndStats();
    } catch (e) {
      alert("운행 취소에 실패했습니다.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalElements / 10)); // 10은 페이지당 표시 개수, 필요시 변수로

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab="drives" setActiveTab={() => {}} />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 운행 대시보드 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">운행 전</p>
                  <h3 className="text-3xl font-bold mt-1">{readyCount}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <i className="fas fa-clock text-blue-500"></i>
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">운행 중</p>
                  <h3 className="text-3xl font-bold mt-1">{drivingCount}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <i className="fas fa-car-side text-green-500"></i>
                </div>
              </div>
            </div>
            {/* 상태 탭 + 새 예약 버튼 한 줄 정렬 */}
            <div className="flex justify-between items-center mb-8 gap-4">
              <div className="flex gap-2">
                {(['READY', 'DRIVING', 'COMPLETED'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${statusTab === tab ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setStatusTab(tab)}
                  >
                    {getStatusLabel(tab)}
                  </button>
                ))}
              </div>
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
              </div>
            </div>

            <DriveList drives={filteredDrivesByStatus} renderExtra={(drive) => (
              <>
                <button
                  className="ml-2 px-2 py-1 text-blue-500 hover:bg-blue-600 rounded text-xs"
                  title="관제 이동"
                  onClick={e => { e.stopPropagation(); handleGoToRealtime(drive.id); }}
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="ml-2 px-2 py-1 text-red-500 hover:bg-red-600 rounded text-xs"
                  title="운행 취소"
                  onClick={e => { e.stopPropagation(); handleCancelDrive(drive.id); }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </>
            )} />

            {totalPages > 1 && (
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