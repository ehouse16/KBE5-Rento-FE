import React from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 다시 활성화

// DriveList 내부에서 사용할 간소화된 Drive 인터페이스 정의
interface Drive {
  id: number; // ID 속성 추가
  memberName: string;
  vehicleNumber: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  isStart: boolean;
  status?: "READY" | "DRIVING" | "COMPLETED";
}

interface DriveListProps {
  drives: Drive[];
}

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

const getStatusLabel = (status?: string) => {
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
      return "bg-blue-100 text-blue-800"; // 운행 전: 파란색
    case "DRIVING":
      return "bg-green-100 text-green-800"; // 운행 중: 초록색
    case "COMPLETED":
      return "bg-red-100 text-red-800"; // 운행 완료: 빨간색
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const DriveList: React.FC<DriveListProps> = ({ drives }) => {
  const navigate = useNavigate(); // useNavigate 다시 활성화

  const handleDriveClick = (driveId: number) => {
    navigate(`/drives/${driveId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drives.map((drive, index) => (
        <div
          key={drive.id} // drive.id로 key 사용
          onClick={() => handleDriveClick(drive.id)} // 상세 보기 기능 다시 활성화
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden cursor-pointer"
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {drive.memberName}
                </h3>
                <p className="text-gray-600 text-sm">
                  {drive.vehicleNumber}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(drive.status)}`}
              >
                {getStatusLabel(drive.status)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 flex justify-center">
                  <i className="fas fa-map-marker-alt text-green-500"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">출발지</p>
                  <p className="text-gray-700">{drive.startLocation}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(drive.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 flex justify-center">
                  <i className="fas fa-flag-checkered text-red-500"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">도착지</p>
                  <p className="text-gray-700">{drive.endLocation}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(drive.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100">
            <span className="text-sm text-gray-600">
              <i className="far fa-clock mr-1"></i>
              {formatTime(drive.startDate)} - {formatTime(drive.endDate)}
            </span>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium !rounded-button whitespace-nowrap cursor-pointer">
              상세 보기{" "}
              <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriveList; 