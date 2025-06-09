import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeReservations: 0,
    totalDrivers: 0,
    monthlyDistance: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, activitiesResponse] = await Promise.all([
          axiosInstance.get('/api/dashboard/stats'),
          axiosInstance.get('/api/dashboard/recent-activities')
        ]);

        setStats({
          totalVehicles: statsResponse.data.totalVehicles,
          activeReservations: statsResponse.data.activeReservations,
          totalDrivers: statsResponse.data.totalDrivers,
          monthlyDistance: statsResponse.data.monthlyDistance,
        });

        setRecentActivities(activitiesResponse.data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, unit = '' }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}{unit}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <i className={`fas ${icon} text-xl text-white`}></i>
        </div>
      </div>
    </div>
  );

  if (loading) return <p>데이터를 불러오는 중입니다...</p>;
  if (error) return <p className="text-red-500">에러 발생: {error}</p>;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 차량"
          value={stats.totalVehicles}
          icon="fa-car"
          color="bg-blue-500"
          unit="대"
        />
        <StatCard
          title="진행중인 예약"
          value={stats.activeReservations}
          icon="fa-calendar-check"
          color="bg-green-500"
          unit="건"
        />
        <StatCard
          title="등록된 운전자"
          value={stats.totalDrivers}
          icon="fa-users"
          color="bg-purple-500"
          unit="명"
        />
        <StatCard
          title="이번달 주행거리"
          value={stats.monthlyDistance}
          icon="fa-road"
          color="bg-orange-500"
          unit="km"
        />
      </div>

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 활동 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.length === 0 && (
                  <p className="text-gray-500">최근 활동이 없습니다.</p>
                )}
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-2 rounded-full bg-gray-100`}>
                      <i className={`fas ${activity.icon} ${activity.color}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full text-center py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                  모든 활동 보기
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
