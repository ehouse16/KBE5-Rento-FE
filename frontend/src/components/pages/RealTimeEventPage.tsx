import React, { useEffect, useState, useRef } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import KakaoMap from '../drive/KakaoMap';
import { PathPoint } from '../../types/drive';

interface Marker {
  lat: number;
  lng: number;
  label?: string;
}

// 여러 차량의 경로와 마커를 차량ID별로 관리
interface VehiclePathMap {
  [vehicleId: string]: PathPoint[];
}
interface VehicleMarkerMap {
  [vehicleId: string]: Marker;
}

const RealTimeEventPage: React.FC = () => {
  const [vehiclePaths, setVehiclePaths] = useState<VehiclePathMap>({});
  const [vehicleMarkers, setVehicleMarkers] = useState<VehicleMarkerMap>({});
  const [trackingStatus, setTrackingStatus] = useState('서버에 연결 중...');
  const eventQueueRef = useRef<any[]>([]); // 이벤트 큐
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [vehicleSearch, setVehicleSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setTrackingStatus('로그인이 필요합니다. SSE 연결을 시작할 수 없습니다.');
      setVehicleMarkers({});
      return;
    }

    setTrackingStatus('SSE 구독 요청 중...');
    const eventSource = new EventSource(`${API_BASE_URL}/api/stream/subscribe?token=${token}`);

    // 연결 성공 시 상태 변경 (EventSourcePolyfill은 onopen 지원)
    eventSource.onopen = () => {
      setTrackingStatus('SSE 구독 성공');
    };

    eventSource.addEventListener('cycle-info', (event) => {
      const messageEvent = event as MessageEvent<any>;
      if (!messageEvent.data) return;
      try {
        const data = JSON.parse(messageEvent.data);
        // 최초 데이터 수신 시 상태 변경 (onopen이 안 먹히는 환경 대비)
        setTrackingStatus('SSE 구독 성공');
        // 큐에 추가
        eventQueueRef.current.push(data);
      } catch (e) {}
    });

    eventSource.addEventListener('heartbeat', () => {
      // ping은 큐에 넣지 않음
    });

    eventSource.onerror = () => {
      setTrackingStatus('연결 오류 발생. 자동 재연결을 시도합니다.');
    };

    return () => {
      eventSource.close();
    };
  }, [API_BASE_URL]);

  // 초당 1개씩 큐에서 꺼내서 상태 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueueRef.current.length > 0) {
        const data = eventQueueRef.current.shift();
        if (data && data.latitude && data.longitude && data.mdn) {
          const vehicleId = data.mdn.toString();
          const newPathPoint: PathPoint = {
            latitude: data.latitude,
            longitude: data.longitude
          };
          setVehiclePaths(prev => {
            const prevPath = prev[vehicleId] || [];
            const last = prevPath[prevPath.length - 1];
            if (last && Math.abs(last.latitude - data.latitude) < 0.0001 && Math.abs(last.longitude - data.longitude) < 0.0001) {
              return prev;
            }
            return { ...prev, [vehicleId]: [...prevPath, newPathPoint] };
          });
          setVehicleMarkers(prev => ({
            ...prev,
            [vehicleId]: {
              lat: data.latitude,
              lng: data.longitude,
              label: `차량MDN: ${vehicleId}`
            }
          }));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 경로 초기화
  const handleClearPath = () => {
    setVehiclePaths({});
  };

  // 전체 경로 포인트 개수
  const totalPoints = Object.values(vehiclePaths).reduce((acc, arr) => acc + arr.length, 0);

  // 필터링된 차량만 지도에 표시
  const filteredVehiclePaths = vehicleSearch.trim()
    ? Object.fromEntries(Object.entries(vehiclePaths).filter(([id]) => id.includes(vehicleSearch.trim())))
    : vehiclePaths;
  const filteredVehicleMarkers = vehicleSearch.trim()
    ? Object.fromEntries(Object.entries(vehicleMarkers).filter(([id]) => id.includes(vehicleSearch.trim())))
    : vehicleMarkers;

  // 차량번호 검색 input에서 엔터 시 검색
  const handleVehicleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setVehicleSearch((prev) => prev); // 엔터 시에도 현재 값으로 필터링(실시간 반영이지만 UX 통일)
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">실시간 관제</h1>
      <div className="mb-4 p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-800">
            연결 상태: <span className="text-blue-600 font-bold">{trackingStatus}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClearPath}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              경로 초기화
            </button>
            <span className="text-sm text-gray-600">
              전체 경로 포인트: {totalPoints}개
            </span>
            <span className="text-sm text-gray-600">
              차량 수: {Object.keys(vehiclePaths).length}대
            </span>
          </div>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="차량번호 검색"
            value={vehicleSearch}
            onChange={e => setVehicleSearch(e.target.value)}
            onKeyDown={handleVehicleSearchKeyDown}
            className="border rounded px-2 py-1 w-60"
          />
        </div>
      </div>
      <KakaoMap vehiclePaths={filteredVehiclePaths} vehicleMarkers={filteredVehicleMarkers} />
    </div>
  );
};

export default RealTimeEventPage;
