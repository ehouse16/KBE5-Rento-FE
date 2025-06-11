import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DriveDetail } from "../../types/drive";
import Header from "../Header";
import Footer from "../Footer";
import Sidebar from "../Sidebar";

const DriveDetailPage: React.FC = () => {
  const { driveId } = useParams<{ driveId: string }>();
  const navigate = useNavigate();
  const [driveDetail, setDriveDetail] = useState<DriveDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriveDetail = async () => {
      try {
        const response = await fetch(`/api/drives/${driveId}`, {
          headers: { AccessToken: localStorage.getItem("accessToken") || "" }
        });
        if (!response.ok) throw new Error("운행 상세 정보를 불러오는데 실패했습니다.");
        const data = await response.json();
        setDriveDetail(data.data);
      } catch (error) {
        alert(error instanceof Error ? error.message : "운행 상세 정보를 불러오는데 실패했습니다.");
        navigate("/drives");
      } finally {
        setLoading(false);
      }
    };

    fetchDriveDetail();
  }, [driveId, navigate]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const handleEndDrive = async () => {
    if (!window.confirm("운행을 종료하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/drives/end/${driveId}`, {
        method: "PATCH",
        headers: { AccessToken: localStorage.getItem("accessToken") || "" }
      });
      if (!response.ok) throw new Error("운행 종료에 실패했습니다.");
      alert("운행이 종료되었습니다.");
      navigate("/drives");
    } catch (error) {
      alert(error instanceof Error ? error.message : "운행 종료에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!driveDetail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">운행 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activeTab="drives" setActiveTab={() => {}} />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center mb-6">
              <button 
                onClick={() => navigate("/drives")}
                className="text-gray-700 mr-4 cursor-pointer"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold">운행 상세</h1>
            </div>

            {/* 상태 배지 */}
            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-white font-medium ${driveDetail.isStart ? "bg-[#8CD867]" : "bg-gray-500"}`}>
                {driveDetail.isStart ? "운행중" : "운행완료"}
              </span>
            </div>

            {/* 차량 정보 카드 */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{driveDetail.vehicle.modelName}</h2>
                <p className="text-gray-600">{driveDetail.vehicle.vehicleNumber}</p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                  {driveDetail.member.profileImage ? (
                    <img
                      src={driveDetail.member.profileImage}
                      alt="사용자 프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-500 text-white">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">운전자</p>
                  <p className="font-medium">{driveDetail.member.name}</p>
                </div>
              </div>
            </div>

            {/* 운행 정보 카드 */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">운행 정보</h3>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#8CD867] bg-opacity-20 flex items-center justify-center mr-4">
                    <i className="fas fa-tag text-green-500"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">운행 유형</p>
                    <p className="font-medium">{driveDetail.driveType}</p>
                  </div>
                </div>

                {/* 시간 정보 */}
                <div className="flex mb-6">
                  <div className="w-10 mr-4 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-6">
                      <p className="text-sm text-gray-500">시작 시간</p>
                      <p className="font-medium">{formatDate(driveDetail.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">종료 시간</p>
                      <p className="font-medium">{formatDate(driveDetail.endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* 위치 정보 */}
                <div className="mb-6">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#8CD867] bg-opacity-20 flex items-center justify-center mr-4">
                      <i className="fas fa-map-marker-alt text-green-500"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">출발 위치</p>
                      <p className="font-medium">{driveDetail.startLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                      <i className="fas fa-flag-checkered text-gray-500"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">도착 위치</p>
                      <p className="font-medium">{driveDetail.endLocation || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* 이동 거리 */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">총 이동 거리</p>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold mr-2">{driveDetail.distance}</span>
                    <span className="text-gray-500">km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 운행 종료 버튼 (운행 중일 때만 표시) */}
            {driveDetail.isStart && (
              <button
                onClick={handleEndDrive}
                className="w-full py-4 bg-[#8CD867] text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 transition-all"
              >
                운행 종료하기
              </button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default DriveDetailPage; 