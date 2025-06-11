import React, { useState, useEffect } from 'react';
import StatCardGrid from './dashboardcard/StatCardGrid';
import axiosInstance from '../../utils/axios';

interface DashboardStats {
  totalVehicles: number;
  activeReservations: number;
  totalDrivers: number;
  operationLogs: number;
}
interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  // companyCode를 useState로!
  const [companyCode, setCompanyCode] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeReservations: 0,
    totalDrivers: 0,
    operationLogs: 0,
  });

  const [notices, setNotices] = useState<Notice[]>([]);

  // companyCode 최초 1회 세팅
  useEffect(() => {
    setCompanyCode(localStorage.getItem("companyCode"));
  }, []);

  // 공지 더미
  useEffect(() => {
    setNotices([
      { id: 1, title: '시스템 점검 안내', content: '6월 15일(토) 00:00 ~ 02:00에 시스템 점검이 예정되어 있습니다.', createdAt: '2025-06-10 09:12' },
      { id: 2, title: '차량 정기점검 결과', content: '모든 차량이 정상적으로 점검 완료되었습니다.', createdAt: '2025-06-08 15:23' },
      { id: 3, title: '신규 기능 출시', content: '이제 예약 시 실시간 위치 확인이 가능합니다.', createdAt: '2025-06-05 10:04' },
    ]);
  }, []);

  // 🚗 차량 수 (companyCode 필요없으면 이대로, 필요하면 파라미터 추가)
  useEffect(() => {
    if (!companyCode) return; // 값 없으면 호출 X
    const fetchVehicleCount = async () => {
      try {
        const res = await axiosInstance.get('/api/vehicles');
        // 데이터 구조에 따라 조정! (content로 내려오면 content, 배열이면 배열로!)
        const vehicleList = Array.isArray(res.data.data?.content)
          ? res.data.data.content
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setStats(prev => ({
          ...prev,
          totalVehicles: vehicleList.length,
        }));
      } catch {
        setStats(prev => ({
          ...prev,
          totalVehicles: 0,
        }));
      }
    };
    fetchVehicleCount();
  }, [companyCode]);

  // 🚕 운전자 수 (companyCode 필요)
  useEffect(() => {
    if (!companyCode) return;
    const fetchDriverCount = async () => {
      try {
        const res = await axiosInstance.get(`/api/members?companyCode=${companyCode}`);
        const driverList = Array.isArray(res.data.data) ? res.data.data : [];
        setStats(prev => ({
          ...prev,
          totalDrivers: driverList.length,
        }));
      } catch {
        setStats(prev => ({
          ...prev,
          totalDrivers: 0,
        }));
      }
    };
    fetchDriverCount();
  }, [companyCode]);

  // 🚙 운행 예약 수 (여기도 companyCode 필요하면 파라미터로 추가!)
  useEffect(() => {
    if (!companyCode) return;
    const fetchActiveReservations = async () => {
      try {
        const res = await axiosInstance.get('/api/drives');
        // 배열로 내려오면 그대로, content에 있으면 content로!
        const activeReservations = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.data?.content)
          ? res.data.data.content
          : [];
        setStats(prev => ({
          ...prev,
          activeReservations: activeReservations.length,
        }));
      } catch {
        setStats(prev => ({
          ...prev,
          activeReservations: 0,
        }));
      }
    };
    fetchActiveReservations();
  }, [companyCode]);

  // 🚦운행 일지 수 (예시, 필요시 실제 API로)
  // useEffect(() => { ... }, [companyCode]);

  // companyCode 없으면 로딩 표시
  if (!companyCode) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">차량 관리 현황을 한눈에 확인하세요</p>
        </div>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      {/* 통계 카드들 */}
      <StatCardGrid
        totalVehicles={stats.totalVehicles}
        activeReservations={stats.activeReservations}
        totalDrivers={stats.totalDrivers}
        operationLogs={stats.operationLogs}
      />

      {/* 공지사항 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">공지사항</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notices.length === 0 && (
                  <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
                )}
                {notices.map((notice) => (
                  <div key={notice.id} className="flex flex-col">
                    <p className="text-sm font-bold text-gray-900">{notice.title}</p>
                    <p className="text-xs text-gray-500">{notice.createdAt}</p>
                    <p className="text-sm text-gray-700 mt-1">{notice.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  모든 공지사항 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
