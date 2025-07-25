import React, { useState, useEffect } from 'react';
import StatCardGrid from './dashboardcard/StatCardGrid';
import axiosInstance from '../../utils/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

interface MonthlyStats {
  year: number;
  month: number;
  totalDistance: number;
  totalDrivingTime: number;
  totalDrivingCnt: number;
  avgSpeed: number;
  businessRatio: number;
  commuteRatio: number;
  nonBusinessRatio: number;
}

const COLORS = ['#1e90ff', '#00c49f', '#ffbb28', '#e5e7eb'];
const toKm = (m: number) => (m / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 });

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

  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // 연도/월 select 옵션
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

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
          totalVehicles: vehicleList.filter((v: any) => !v.delete).length,
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

  // 🚦 운행중인 차량 수 (운행 중 상태만)
  useEffect(() => {
    if (!companyCode) return;
    const fetchDrivingVehicles = async () => {
      try {
        const res = await axiosInstance.get('/api/drives');
        const drives = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.data?.content)
          ? res.data.data.content
          : [];
        const drivingVehicles = drives.filter((d: any) => d.status === 'DRIVING' && !d.delete).length;
        setStats(prev => ({
          ...prev,
          operationLogs: drivingVehicles,
        }));
      } catch {
        setStats(prev => ({
          ...prev,
          operationLogs: 0,
        }));
      }
    };
    fetchDrivingVehicles();
  }, [companyCode]);

  // 🚕 운전자 수 (companyCode 필요)
  useEffect(() => {
    if (!companyCode) return;
    const fetchDriverCount = async () => {
      try {
        const res = await axiosInstance.get(`/api/members?companyCode=${companyCode}`);
        const driverList = Array.isArray(res.data.data?.content) ? res.data.data.content : [];
        setStats(prev => ({
          ...prev,
          totalDrivers: driverList.filter((m: any) => !m.delete).length,
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

  // 🚙 진행중인 예약 수 (운행 전 + 운행 중)
  useEffect(() => {
    if (!companyCode) return;
    const fetchActiveReservations = async () => {
      try {
        const res = await axiosInstance.get('/api/drives');
        const drives = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.data?.content)
          ? res.data.data.content
          : [];
        // 진행중인 예약: READY(운행 전) + DRIVING(운행 중)
        const activeReservations = drives.filter(
          (d: any) => (d.status === 'READY' || d.status === 'DRIVING') && !d.delete
        ).length;
        setStats(prev => ({
          ...prev,
          activeReservations,
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

  // 1~12월 전체 월별 통계 데이터 불러오기
  useEffect(() => {
    if (!companyCode) return;
    const fetchYearlyStats = async () => {
      try {
        const requests = months.map((m) =>
          axiosInstance.get('/api/monthly/stats', {
            params: {
              companyCode,
              year: selectedYear,
              month: m,
            }
          })
        );
        const results = await Promise.allSettled(requests);
        const stats = results.map((res, idx) => {
          const monthLabel = `${selectedYear}.${String(idx + 1).padStart(2, '0')}`;
          if (res.status === 'fulfilled' && res.value.data?.data) {
            return { ...res.value.data.data, monthLabel, month: idx + 1 };
          }
          return {
            year: selectedYear,
            month: idx + 1,
            totalDistance: 0,
            totalDrivingTime: 0,
            totalDrivingCnt: 0,
            avgSpeed: 0,
            businessRatio: 0,
            commuteRatio: 0,
            nonBusinessRatio: 0,
            monthLabel,
          };
        });
        setMonthlyStats(stats);
      } catch (e) {
        setMonthlyStats([]);
      }
    };
    fetchYearlyStats();
  }, [companyCode, selectedYear]);

  // 선택 연/월 데이터만 받아오기 (카드/비율용)
  useEffect(() => {
    if (!companyCode) return;
    const fetchMonthlyStat = async () => {
      try {
        const res = await axiosInstance.get('/api/monthly/stats', {
          params: {
            companyCode,
            year: selectedYear,
            month: selectedMonth,
          }
        });
        const stat = res.data?.data || {};
        const monthLabel = `${selectedYear}.${String(selectedMonth).padStart(2, '0')}`;
        setMonthlyStats((prev) => {
          // 그래프용은 그대로 두고, 카드/비율용만 최신 값으로 갱신
          const updated = prev.map(s => s.month === selectedMonth ? { ...stat, monthLabel, month: selectedMonth } : s);
          // 만약 그래프용 데이터가 없으면 한 개만 추가
          if (updated.length === 0) return [{ ...stat, monthLabel, month: selectedMonth }];
          return updated;
        });
      } catch (e) {
        // 그래프용 데이터는 그대로 두고, 카드/비율용만 0으로 갱신
        setMonthlyStats((prev) => prev.map(s => s.month === selectedMonth ? {
          year: selectedYear,
          month: selectedMonth,
          totalDistance: 0,
          totalDrivingTime: 0,
          totalDrivingCnt: 0,
          avgSpeed: 0,
          businessRatio: 0,
          commuteRatio: 0,
          nonBusinessRatio: 0,
          monthLabel: `${selectedYear}.${String(selectedMonth).padStart(2, '0')}`
        } : s));
      }
    };
    fetchMonthlyStat();
  }, [companyCode, selectedYear, selectedMonth]);

  const latest = monthlyStats.find((s) => s.month === selectedMonth) || {
    year: selectedYear,
    month: selectedMonth,
    totalDistance: 0,
    totalDrivingTime: 0,
    totalDrivingCnt: 0,
    avgSpeed: 0,
    businessRatio: 0,
    commuteRatio: 0,
    nonBusinessRatio: 0,
    monthLabel: `${selectedYear}.${String(selectedMonth).padStart(2, '0')}`
  };
  const donutData = [
    { name: '업무용', value: latest.businessRatio || 0 },
    { name: '출·퇴근', value: latest.commuteRatio || 0 },
    { name: '비업무', value: latest.nonBusinessRatio || 0 },
  ];
  const donutAllZero = donutData.every(d => d.value === 0);

  // 평균 계산 (예시: 30일, 4주)
  const dayAvgCnt = latest.totalDrivingCnt ? (latest.totalDrivingCnt / 30).toFixed(1) : '0.0';
  const weekAvgCnt = latest.totalDrivingCnt ? (latest.totalDrivingCnt / 4).toFixed(1) : '0.0';
  const monthAvgCnt = latest.totalDrivingCnt || 0;
  const dayAvgDist = latest.totalDistance ? toKm(latest.totalDistance / 30) : '0.0';
  const weekAvgDist = latest.totalDistance ? toKm(latest.totalDistance / 4) : '0.0';
  const monthAvgDist = latest.totalDistance ? toKm(latest.totalDistance) : '0.0';

  // Y축 최대값 계산
  const maxDistance = Math.max(...monthlyStats.map(s => s.totalDistance), 0);

  // companyCode 없으면 로딩 표시
  if (!companyCode) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mr-4">운행 리포트</h1>
      </div>

      {/* 통계 카드들 (기존) */}
      <StatCardGrid
        totalVehicles={stats.totalVehicles}
        activeReservations={stats.activeReservations}
        totalDrivers={stats.totalDrivers}
        operationLogs={stats.operationLogs}
      />

      {/* 운행 리포트 가로형 카드 (select는 카드 내부 왼쪽 상단) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col relative mt-8">
        {/* select: 카드 내부 왼쪽 상단 */}
        <div className="absolute left-6 top-6 flex gap-2">
          <select className="border rounded px-3 py-1" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y} 년</option>)}
          </select>
          <select className="border rounded px-3 py-1" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
            {months.map(m => <option key={m} value={m}>{m} 월</option>)}
          </select>
        </div>
        <div className="flex flex-row justify-between items-center gap-8">
          {/* 운행 건수 */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-[180px]">
            <div className="text-[#22c55e] text-4xl font-bold mb-1">{latest.totalDrivingCnt ?? 0} 건</div>
            <div className="text-gray-500 mb-2 text-lg">운행 건수</div>
            <div className="flex flex-col gap-1 text-base text-gray-500">
              <div>일 평균 <span className="text-black font-semibold">{dayAvgCnt} 건</span></div>
              <div>주 평균 <span className="text-black font-semibold">{weekAvgCnt} 건</span></div>
              <div>월 평균 <span className="text-black font-semibold">{monthAvgCnt} 건</span></div>
            </div>
          </div>
          {/* 운행 거리 */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-[180px]">
            <div className="text-[#22c55e] text-4xl font-bold mb-1">{toKm(latest.totalDistance ?? 0)} km</div>
            <div className="text-gray-500 mb-2 text-lg">운행 거리</div>
            <div className="flex flex-col gap-1 text-base text-gray-500">
              <div>일 평균 <span className="text-black font-semibold">{dayAvgDist} km</span></div>
              <div>주 평균 <span className="text-black font-semibold">{weekAvgDist} km</span></div>
              <div>월 평균 <span className="text-black font-semibold">{monthAvgDist} km</span></div>
            </div>
          </div>
          {/* 업무용 운행 비율(도넛+legend) */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-[220px]">
            <div className="flex flex-col items-center">
              <PieChart width={120} height={120}>
                <Pie
                  data={donutAllZero ? [{ name: '없음', value: 1 }] : donutData.slice(0, 3)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutAllZero
                    ? <Cell fill="#e5e7eb" />
                    : donutData.slice(0, 3).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                      ))}
                </Pie>
              </PieChart>
              <div className="text-gray-500 text-base">운행 비율</div>
            </div>
            <div className="flex flex-col gap-1 mt-4 text-base">
              <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-1" style={{background: COLORS[0]}}></span>업무용 <span className="ml-1 font-semibold" style={{color: COLORS[0]}}>{donutData[0].value.toFixed(1)}%</span></span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-1" style={{background: COLORS[1]}}></span>출·퇴근 <span className="ml-1 font-semibold" style={{color: COLORS[1]}}>{donutData[1].value.toFixed(1)}%</span></span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-1" style={{background: COLORS[2]}}></span>비업무 <span className="ml-1 font-semibold" style={{color: COLORS[2]}}>{donutData[2].value.toFixed(1)}%</span></span>
            </div>
          </div>
        </div>
      </div>

        {/* 월별 stacked bar chart (1~12월 전체) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-left">월간 운행거리</h2>
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-ignore */}
            <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} onClick={state => {
              if (state && state.activeLabel) {
                const m = Number(state.activeLabel.split('.')[1]);
                setSelectedMonth(m);
              }
            }}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* @ts-ignore */}
              <XAxis dataKey="monthLabel" />
              {/* @ts-ignore */}
              <YAxis tickFormatter={toKm} label={{ value: 'km', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#888' } }} domain={[0, maxDistance === 0 ? 100 : Math.ceil(maxDistance / 100) * 100]} />
              {/* @ts-ignore */}
              <Tooltip formatter={(value, name) => [`${toKm(Number(value))} km`, name]} />
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Bar dataKey="totalDistance" name="총 주행거리" fill="#22c55e" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>


      {/* 공지사항 
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
      </div>*/}
    </div>
  );
};

export default DashboardPage;
