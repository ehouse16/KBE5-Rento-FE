import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DriveDetail, PathPoint } from "../../types/drive";
import Header from "../Header";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import axiosInstance from '../../utils/axios';
import KakaoMap from "./KakaoMap";

const DriveDetailPage: React.FC = () => {
  const { driveId } = useParams<{ driveId: string }>();
  const navigate = useNavigate();
  const [driveDetail, setDriveDetail] = useState<DriveDetail | null>(null);
  const [path, setPath] = useState<PathPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [endLoading, setEndLoading] = useState(false);
  const [endSuccess, setEndSuccess] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriveData = async () => {
      if (!driveId) return;
      setLoading(true);
      setApiError(null);
      try {
        // 운행 상세 정보와 경로 정보를 동시에 요청
        const [detailResponse, pathResponse] = await Promise.all([
          axiosInstance.get(`/api/drives/${driveId}`),
          axiosInstance.get(`/api/cycleInfoSummary/${driveId}`)
        ]);

        const detailData = detailResponse.data;
        setDriveDetail(detailData.data || detailData.result || detailData);
        
        const pathData = pathResponse.data;
        // 백엔드 응답이 바로 배열일 경우를 처리
        setPath(Array.isArray(pathData) ? pathData : pathData.data || pathData.result || []);

      } catch (e) {
        console.error("Failed to fetch drive data:", e);
        setApiError('운행 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriveData();
  }, [driveId]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const handleEndDrive = async () => {
    if (!driveId) return;
    setEndLoading(true);
    try {
      await axiosInstance.put(`/api/drives/end/${driveId}`);
      setEndSuccess(true);
    } catch (e) {
      setEndError('운행 종료에 실패했습니다.');
    } finally {
      setEndLoading(false);
    }
  };

  // 상태값 한글 변환 함수 및 색상 클래스 함수 수정
  const getDriveStatusLabel = (status?: string) => {
    switch (status) {
      case "READY":
        return "운행 전";
      case "DRIVING":
        return "운행 중";
      case "COMPLETED":
        return "운행 완료";
      default:
        return "알 수 없음";
    }
  };
  const getStatusClass = (status?: string) => {
    switch (status) {
      case "READY":
        return "bg-blue-100 text-blue-800";
      case "DRIVING":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-red-500">{apiError}</div>
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

  const status = driveDetail.driveStatus;

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
              <span className={`inline-block px-4 py-2 rounded-full font-medium ${getStatusClass(status)}`}>
                {getDriveStatusLabel(status)}
              </span>
            </div>

            {/* 차량 정보 카드 */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{driveDetail.vehicleNumber}</h2>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4 flex items-center justify-center bg-green-500 text-white">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">운전자</p>
                  <p className="font-medium">{driveDetail.memberName}</p>
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

            {/* 이동 경로 맵 */}
            {driveDetail.driveStatus === 'COMPLETED' && path && path.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">이동 경로</h3>
                {/* 출발/도착 마커 생성 */}
                {(() => {
                  const markers = [];
                  if (path && path.length > 0) {
                    markers.push({
                      lat: path[0].latitude,
                      lng: path[0].longitude,
                      label: '출발',
                    });
                    markers.push({
                      lat: path[path.length - 1].latitude,
                      lng: path[path.length - 1].longitude,
                      label: '도착',
                    });
                  }
                  return <KakaoMap path={path} markers={markers} />;
                })()}
              </div>
            )}

            {/* 운행 종료 버튼 (운행 중일 때만 표시) */}
            {driveDetail.driveStatus === 'DRIVING' && (
              <button
                onClick={handleEndDrive}
                className="w-full py-4 bg-[#8CD867] text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 transition-colors duration-200"
                disabled={endLoading}
              >
                {endLoading ? '운행 종료 중...' : '운행 종료하기'}
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