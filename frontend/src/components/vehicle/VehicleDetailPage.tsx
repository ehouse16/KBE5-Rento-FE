import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import Footer from "../Footer";
import DriveRegisterModal from "../drive/DriveRegisterModal";
import { VehicleDetail } from "../../types/vehicle";
import axiosInstance from '../../utils/axios';

const VehicleDetailPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("vehicles");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicleDetail = async () => {
      if (!vehicleId) {
        setError("차량 ID가 없습니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/vehicles/${vehicleId}`);
        const data = response.data;
        
        // API 응답 구조에 맞게 데이터 파싱
        const vehicleData = data.data || data.result || data;
        
        // 기본 데이터에 추가 정보 설정 (실제 API 응답에 따라 조정 필요)
        const enhancedVehicle: VehicleDetail = {
          ...vehicleData,
          year: vehicleData.year || 2023,
          maxDistance: vehicleData.maxDistance || 458,
          maxPower: vehicleData.maxPower || 217,
          fastChargeTime: vehicleData.fastChargeTime || "18분 (10% → 80%)",
        };
        
        setVehicle(enhancedVehicle);
        setError(null);
      } catch (err) {
        console.error("차량 상세 정보 조회 실패:", err);
        setError(err instanceof Error ? err.message : "차량 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetail();
  }, [vehicleId]);

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleReservationClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleReservationSuccess = () => {
    setIsModalOpen(false);
    // 예약 성공 후 운행 목록 페이지로 이동
    navigate("/drives");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main style={{ flex: 1, padding: "32px" }}>
          <div className="max-w-4xl mx-auto">
            {/* 뒤로가기 버튼 */}
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-700 hover:text-[#90C640] mb-6 transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
              <span className="ml-2 font-medium">뒤로</span>
            </button>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#90C640] hover:bg-[#7db535] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : vehicle ? (
              <>
                {/* 차량 번호 */}
                <div className="mb-6">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-base font-medium inline-block">
                    {vehicle.vehicleNumber}
                  </div>
                </div>

                {/* 차량 기본 정보 */}
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    {vehicle.brand}
                  </h2>
                  <h2 className="text-gray-600 text-lg">
                  {vehicle.modelName}
                  </h2>
                  
                </div>

                {/* 차량 상세 스펙 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
                        <i className="fas fa-car text-green-500 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">차종</p>
                        <p className="text-gray-800 font-semibold">
                          {vehicle.vehicleType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
                        <i className="fas fa-gas-pump text-green-500 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">연료 타입</p>
                        <p className="text-gray-800 font-semibold">
                          {vehicle.fuelType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
                        <i className="fas fa-road text-green-500 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">총 주행거리</p>
                        <p className="text-gray-800 font-semibold">
                          {(vehicle.totalDistanceKm / 1000).toFixed(1)} km
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
                        <i className="fas fa-battery-three-quarters text-green-500 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">배터리 전압</p>
                        <p className="text-gray-800 font-semibold">
                          {vehicle.batteryVoltage}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 추가 정보 섹션 */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    차량 추가 정보
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600">제조년도</span>
                      <span className="text-gray-800 font-medium"></span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600">등록 일자</span>
                      <span className="text-gray-800 font-medium"></span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600">오일 교체 일자</span>
                      <span className="text-gray-800 font-medium"></span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600">타이어 교체 일자</span>
                      <span className="text-gray-800 font-medium">
                
                      </span>
                    </div>
                  </div>
                </div>

                {/* 예약하기 버튼 */}
                <div className="mt-8">
                  <button
                    onClick={handleReservationClick}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium text-lg transition-colors duration-300 cursor-pointer"
                  >
                    예약하기
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
      <Footer />
      
      {/* 운행 등록 모달 */}
      <DriveRegisterModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleReservationSuccess}
        selectedVehicleId={vehicleId}
      />
    </div>
  );
};

export default VehicleDetailPage; 