import React, { useEffect, useState, useRef } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import KakaoMap from '../drive/KakaoMap';
import { PathPoint } from '../../types/drive';
import axiosInstance from '../../utils/axios';
import { useLocation, useSearchParams } from 'react-router-dom';

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

interface DrivingVehicle {
  id: number;
  mdn: string;
  memberName: string;
  vehicleNumber: string;
  startLocation: string;
  endLocation: string;
  startDate: string;
  driveStatus: 'READY' | 'DRIVING' | 'COMPLETED';
}

const RealTimeEventPage: React.FC = () => {
  const [vehiclePaths, setVehiclePaths] = useState<VehiclePathMap>({});
  const [vehicleMarkers, setVehicleMarkers] = useState<VehicleMarkerMap>({});
  const [trackingStatus, setTrackingStatus] = useState('서버에 연결 중...');
  const eventQueueRef = useRef<any[]>([]); // 이벤트 큐
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [drivingList, setDrivingList] = useState<DrivingVehicle[]>([]);
  const [vehicleFocusId, setVehicleFocusId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({ lat: 37.5665, lng: 126.9780 });
  const [mapLevel, setMapLevel] = useState(8);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [noDataTimeout, setNoDataTimeout] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const userInteractedRef = useRef(false); // 사용자 지도 조작 감지 ref
  const userInteractedTimer = useRef<NodeJS.Timeout | null>(null);
  const [resetUserInteracted, setResetUserInteracted] = useState(0); // KakaoMap userInteractedRef 리셋용
  const updateQueueRef = useRef(false);
  const latestDataRef = useRef<{ [mdn: string]: any }>({});
  const lastReceivedRef = useRef<{ [mdn: string]: number }>({});

  // driveId 쿼리 파싱
  const driveIdParam = searchParams.get('driveId');

  useEffect(() => {
    console.log('RealTimeEventPage mounted');
    return () => {
      console.log('RealTimeEventPage unmounted');
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setTrackingStatus('로그인이 필요합니다. SSE 연결을 시작할 수 없습니다.');
      setVehicleMarkers({});
      return;
    }

    setTrackingStatus('SSE 구독 요청 중...');
    const eventSource = new EventSource(`${API_BASE_URL}/api/stream/subscribe?token=${token}`);

    eventSource.onopen = () => {
      setTrackingStatus('SSE 구독 성공');
    };

    eventSource.addEventListener('cycle-info', (event) => {
      const messageEvent = event as MessageEvent<any>;
      if (!messageEvent.data) return;
      try {
        const data = JSON.parse(messageEvent.data);
        setTrackingStatus('SSE 구독 성공');
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item && item.mdn) {
              eventQueueRef.current.push(item);
            }
          });
        } else if (data && data.mdn) {
          eventQueueRef.current.push(data);
        }
      } catch (e) {}
    });

    eventSource.addEventListener('heartbeat', () => {});
    eventSource.onerror = () => {
      setTrackingStatus('연결 오류 발생. 자동 재연결을 시도합니다.');
    };

    return () => {
      console.log('SSE useEffect cleanup (eventSource close)');
      eventSource.close();
    };
  }, []);

  // 1초마다 큐에서 하나씩 꺼내서 반영
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueueRef.current.length > 0) {
        const item = eventQueueRef.current.shift();
        if (item && item.mdn) {
          lastReceivedRef.current[String(item.mdn)] = Date.now();
          latestDataRef.current[String(item.mdn)] = item;
        }
      }
    }, 1000); // 1초에 하나씩
    return () => clearInterval(interval);
  }, []);

  // 10초 동안 cycle-info가 오지 않은 mdn의 마커/경로 삭제
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setVehicleMarkers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(mdn => {
          const last = lastReceivedRef.current[String(mdn)];
          const diff = now - (last || 0);
          if (diff > 10000) { // 10초가 지난 mdn은 즉시 삭제
            delete updated[mdn];
          }
        });
        if (Object.keys(updated).length === 0) return {};
        return updated;
      });
      setVehiclePaths(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(mdn => {
          const last = lastReceivedRef.current[String(mdn)];
          const diff = now - (last || 0);
          if (diff > 60000) { // 1분이 지난 mdn만 삭제
            delete updated[mdn];
          }
        });
        if (Object.keys(updated).length === 0) return {};
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // drivingList를 mdn 기준으로 차량번호 맵으로 변환
  const vehicleNumberMap = React.useMemo(() => {
    const map: { [mdn: string]: string } = {};
    drivingList.forEach(d => {
      map[d.mdn] = d.vehicleNumber;
    });
    return map;
  }, [drivingList]);

  // 초당 1회, 모든 차량의 최신값만 반영
  useEffect(() => {
    const interval = setInterval(() => {
      const allLatest = Object.values(latestDataRef.current);
      allLatest.forEach((data: any) => {
        if (data && data.latitude && data.longitude && data.mdn) {
          const vehicleId = data.mdn.toString();
          const newPathPoint: PathPoint = {
            latitude: data.latitude,
            longitude: data.longitude
          };
          setVehiclePaths(prev => {
            const prevPath = prev[vehicleId] || [];
            const last = prevPath[prevPath.length - 1];
            // 중복 좌표는 무시
            if (last && Math.abs(last.latitude - data.latitude) < 0.0001 && Math.abs(last.longitude - data.longitude) < 0.0001) {
              return prev;
            }
            return { ...prev, [vehicleId]: [...prevPath, newPathPoint] };
          });
          setVehicleMarkers(prev => {
            if (prev[vehicleId] && prev[vehicleId].lat === data.latitude && prev[vehicleId].lng === data.longitude) {
              return prev;
            }
            return {
              ...prev,
              [vehicleId]: {
                lat: data.latitude,
                lng: data.longitude,
                label: vehicleNumberMap[vehicleId] || '' // 차량번호를 label로
              }
            };
          });
        }
      });
      // 최신값 반영 후 초기화(필요시)
      // latestDataRef.current = {};
    }, 1000);
    return () => clearInterval(interval);
  }, [vehicleNumberMap]);

  // 실시간 운행중 차량 목록 불러오기 (검색어 반영)
  useEffect(() => {
    const fetchDrivingList = async () => {
      try {
        const params = listSearch.trim() ? `?vehicleNumber=${encodeURIComponent(listSearch.trim())}` : '';
        const res = await axiosInstance.get(`/api/drives/driving${params}`);
        const list = res.data.data || res.data.result || [];
        setDrivingList(list
          .filter((d: any) => d.mdn)
          .map((d: any) => ({
            id: d.id,
            mdn: d.mdn.toString(),
            memberName: d.memberName,
            vehicleNumber: d.vehicleNumber,
            startLocation: d.startLocation,
            endLocation: d.endLocation,
            startDate: d.startDate,
            driveStatus: d.driveStatus,
          }))
        );
      } catch (e) {
        setDrivingList([]);
      }
    };
    fetchDrivingList();
    const interval = setInterval(fetchDrivingList, 5000);
    return () => clearInterval(interval);
  }, [listSearch]);

  // driveId로 포커스할 mdn 찾기
  useEffect(() => {
    if (driveIdParam && drivingList.length > 0) {
      const found = drivingList.find(d => String(d.id) === String(driveIdParam));
      if (found) {
        setVehicleFocusId(found.mdn);
        // 차량 위치가 있으면 지도 중심/줌도 이동
        const marker = vehicleMarkers[found.mdn];
        if (marker) {
          setMapCenter({ lat: marker.lat, lng: marker.lng });
          setMapLevel(4);
        }
      }
    }
  }, [driveIdParam, drivingList, vehicleMarkers]);

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

  // 상태 뱃지 함수
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'READY': return '운행 전';
      case 'DRIVING': return '운행 중';
      case 'COMPLETED': return '운행 완료';
      default: return status;
    }
  };
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-blue-100 text-blue-800';
      case 'DRIVING': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };

  // 차량 목록 클릭 시 mdn으로 포커스 + 지도 중심/줌 이동
  const handleVehicleClick = (mdn: string) => {
    if (vehicleMarkers[mdn]) {
      userInteractedRef.current = false; // 프로그래밍적 이동임을 명확히!
      setVehicleSearch(''); // 전담 관제 진입 시 검색어 초기화
      // 차량 위치가 있으면 지도 중심도 이동
      const marker = vehicleMarkers[mdn];
      setMapCenter({ lat: marker.lat, lng: marker.lng });
      setMapLevel(4); // 차량 관제시 충분히 줌인
      setVehicleFocusId(null);
      setResetUserInteracted(prev => prev + 1);
      setTimeout(() => {
        setVehicleFocusId(mdn);
        setResetUserInteracted(prev => prev + 1);
      }, 100); // 100ms 딜레이 후 전담 관제 진입
    } else {
      window.alert('해당 차량의 실시간 위치 데이터가 아직 도착하지 않았습니다.');
    }
  };

  // KakaoMap에서 사용자 조작 이벤트를 감지할 수 있도록 콜백 추가
  const handleUserMapInteraction = () => {
    userInteractedRef.current = true;
    if (userInteractedTimer.current) clearTimeout(userInteractedTimer.current);
    userInteractedTimer.current = setTimeout(() => {
      userInteractedRef.current = false;
    }, 1000); // 1초 후 자동 리셋
  };

  // 지도에서 줌/이동 등 조작 시 전체 모드로 복귀 + center/level 갱신
  const handleMapChange = (center?: { lat: number, lng: number }, level?: number) => {
    if (center) setMapCenter(center);
    if (level !== undefined) setMapLevel(level);
    console.log('onMapChange', 'userInteractedRef:', userInteractedRef.current, 'vehicleFocusId:', vehicleFocusId);
    if (userInteractedRef.current) {
      setVehicleFocusId(null);
      userInteractedRef.current = false;
      if (userInteractedTimer.current) clearTimeout(userInteractedTimer.current);
    }
  };

  // 운행 목록(drivingList)과 실시간 데이터(vehicleMarkers)의 mdn 합집합으로 표시할 차량 결정
  const allMdns = Array.from(new Set([
    ...drivingList.map(d => d.mdn),
    ...Object.keys(vehicleMarkers)
  ]));

  // 좌측 목록에 표시할 차량 (vehicleMarkers에 남아있는 mdn만)
  // 운행 목록(drivingList) 전체를 항상 리스트에 표시하고, 실시간 위치 데이터가 있는지 여부를 추가
  const displayDrivingList = drivingList.map(v => ({
    ...v,
    hasRealtime: !!vehicleMarkers[v.mdn]
  }));

  console.log('[실시간 관제] displayDrivingList.length:', displayDrivingList.length, displayDrivingList);

  // 지도에 표시할 데이터도 합집합 기준으로 필터링
  let mapMarkers = {};
  let mapPaths = {};
  if (vehicleFocusId) {
    if (vehicleMarkers[vehicleFocusId]) {
      mapMarkers = { [vehicleFocusId]: vehicleMarkers[vehicleFocusId] };
      mapPaths = vehiclePaths[vehicleFocusId] ? { [vehicleFocusId]: vehiclePaths[vehicleFocusId] } : {};
    } else {
      // 실시간 데이터가 아직 없을 때 임시 마커(로딩 표시 등)라도 전달
      mapMarkers = { [vehicleFocusId]: { lat: mapCenter.lat, lng: mapCenter.lng, label: '로딩 중...' } };
      mapPaths = {};
    }
  } else if (vehicleSearch.trim()) {
    mapMarkers = Object.fromEntries(Object.entries(vehicleMarkers).filter(([id]) => id.includes(vehicleSearch.trim())));
    mapPaths = Object.fromEntries(Object.entries(vehiclePaths).filter(([id]) => id.includes(vehicleSearch.trim())));
  } else {
    mapMarkers = Object.fromEntries(allMdns.map(mdn => [mdn, vehicleMarkers[mdn]]).filter(([_, v]) => v));
    mapPaths = Object.fromEntries(allMdns.map(mdn => [mdn, vehiclePaths[mdn]]).filter(([_, v]) => v));
  }

  // 안내 메시지 딜레이 효과
  useEffect(() => {
    if (driveIdParam && vehicleFocusId && !vehicleMarkers[vehicleFocusId]) {
      setNoDataTimeout(false);
      const timeout = setTimeout(() => setNoDataTimeout(true), 1000);
      return () => clearTimeout(timeout);
    } else {
      setNoDataTimeout(false);
    }
  }, [driveIdParam, vehicleFocusId, vehicleMarkers]);

  // vehicleMarkers, vehicleFocusId 상태 변화 추적
  useEffect(() => {
    console.log('[렌더링] vehicleMarkers keys:', Object.keys(vehicleMarkers), 'vehicleFocusId:', vehicleFocusId);
    if (Object.keys(vehicleMarkers).length === 0) {
      console.error('[렌더링] vehicleMarkers is EMPTY! This should not happen unless SSE/토큰/상위 상태가 초기화됨', new Date());
    }
  }, [vehicleMarkers, vehicleFocusId]);

  return (
    <div className="flex w-full min-h-[800px]">
      {/* 실시간 운행중 차량 목록 (왼쪽 3) */}
      <div className="w-3/12 p-4 border-r bg-gray-50 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">실시간 운행중 차량</h2>
        <input
          type="text"
          placeholder="차량번호 검색"
          value={listSearch}
          onChange={e => setListSearch(e.target.value)}
          className="border rounded px-2 py-1 w-full mb-4"
        />
        {displayDrivingList.length === 0 ? (
          <div className="text-gray-500 text-sm">운행중인 차량이 없습니다.</div>
        ) : (
          <ul className="space-y-3">
            {displayDrivingList.map((v) => {
              if (!v.hasRealtime) {
                console.log(`[실시간 관제] 차량 ${v.vehicleNumber} (mdn: ${v.mdn}) 실시간 위치 없음`);
              }
              return (
                <li
                  key={v.mdn}
                  className={`bg-white rounded-lg shadow p-3 flex flex-col gap-1 cursor-pointer hover:bg-green-50 ${vehicleFocusId === v.mdn ? 'ring-4 ring-blue-400' : ''}`}
                  onClick={() => handleVehicleClick(v.mdn)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{v.memberName}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(v.driveStatus)}`}>{getStatusLabel(v.driveStatus)}</span>
                  </div>
                  <div className="text-gray-600 text-sm">차량번호: {v.vehicleNumber}</div>
                  <div className="text-gray-600 text-xs">출발지: {v.startLocation}</div>
                  <div className="text-gray-600 text-xs">도착지: {v.endLocation}</div>
                  <div className="text-gray-500 text-xs">시작: {formatDate(v.startDate)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {/* 지도 (오른쪽 7) */}
      <div className="w-9/12 p-4">
        <h1 className="text-2xl font-bold mb-4">실시간 관제</h1>
        {/* 전담 관제 안내 메시지 */}
        {vehicleFocusId && (
          <div className="mb-3 p-3 bg-blue-100 text-blue-800 font-bold rounded text-center shadow">
            현재 <span className="underline">{drivingList.find(v => v.mdn === vehicleFocusId)?.vehicleNumber || vehicleFocusId}</span> 차량 전담 관제 중입니다.<br/>
            (지도를 이동/줌하면 전체 차량 모드로 복귀합니다)
          </div>
        )}
        {/* 안내 메시지: driveId 관제 시 실시간 데이터 없을 때 */}
        {(driveIdParam && vehicleFocusId && !vehicleMarkers[vehicleFocusId] && !noDataTimeout) && (
          <div className="text-center text-gray-500 font-bold mb-2">
            실시간 위치 데이터 로딩 중...
          </div>
        )}
        {(driveIdParam && vehicleFocusId && !vehicleMarkers[vehicleFocusId] && noDataTimeout) && (
          <div className="text-center text-red-500 font-bold mb-2">
            해당 운행의 실시간 위치 데이터가 없습니다.<br/>
            (차량이 아직 운행을 시작하지 않았거나, 데이터가 도착하지 않았을 수 있습니다)
          </div>
        )}
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
        </div>
        <KakaoMap
          vehiclePaths={mapPaths}
          vehicleMarkers={mapMarkers}
          onMapChange={handleMapChange}
          vehicleFocusId={vehicleFocusId}
          mapCenter={mapCenter}
          mapLevel={mapLevel}
          // 사용자 조작 이벤트 콜백 전달
          onUserInteraction={handleUserMapInteraction}
          programmaticMove={true}
          resetUserInteracted={resetUserInteracted}
        />
      </div>
    </div>
  );
};

export default RealTimeEventPage;
