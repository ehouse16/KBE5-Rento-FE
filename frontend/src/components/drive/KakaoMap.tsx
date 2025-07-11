import React, { useEffect, useRef, useState } from 'react';
import { PathPoint } from '../../types/drive';
// import { FaCar } from 'react-icons/fa'; // 삭제

// 카카오맵 API가 window 객체에 전역으로 등록되므로, 타입 선언이 필요합니다.
declare global {
  interface Window {
    kakao: any;
  }
}

interface Marker {
  lat: number;
  lng: number;
  label?: string;
  vehicleNumber?: string; // ← 이 줄 추가
}

interface KakaoMapProps {
  // 여러 차량용
  vehiclePaths?: { [vehicleId: string]: PathPoint[] };
  vehicleMarkers?: { [vehicleId: string]: Marker };
  // 단일 경로/마커용 (운행 상세 등)
  path?: PathPoint[];
  markers?: Marker[];
  onMapChange?: (center?: { lat: number, lng: number }, level?: number) => void;
  vehicleFocusId?: string | null;
  mapCenter?: { lat: number, lng: number };
  mapLevel?: number;
  onUserInteraction?: () => void;
  programmaticMove?: boolean; // 프로그래밍적 이동 여부 prop 추가
  resetUserInteracted?: number; // 외부에서 userInteractedRef 리셋용 prop
  disablePolyline?: boolean; // 폴리라인(선) 그리기 비활성화
}

const KAKAO_MAP_APP_KEY = process.env.REACT_APP_KAKAO_MAP_APP_KEY;

// 차량별 색상 팔레트 (10개, 필요시 더 추가)
const colorPalette = [
  '#e91e63', // 진분홍
  '#1976d2', // 파랑
  '#43a047', // 초록
  '#ff9800', // 주황
  '#8e24aa', // 보라
  '#f44336', // 빨강
  '#00bcd4', // 청록
  '#ffb300', // 노랑
  '#6d4c41', // 갈색
  '#009688', // 짙은 청록
];

// vehicleId별 색상 반환 함수
function getColorByVehicleId(vehicleId: string, idx: number) {
  // vehicleId가 숫자면 그걸로, 아니면 idx로 fallback
  const n = parseInt(vehicleId, 10);
  if (!isNaN(n)) return colorPalette[n % colorPalette.length];
  return colorPalette[idx % colorPalette.length];
}

const KakaoMap: React.FC<KakaoMapProps> = ({ vehiclePaths, vehicleMarkers, path, markers, onMapChange, vehicleFocusId, mapCenter, mapLevel, onUserInteraction, programmaticMove = false, resetUserInteracted, disablePolyline = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]); // 오버레이/폴리라인 추적
  const userInteractedRef = useRef(false); // 사용자가 지도 이동/줌 했는지
  const lastCenterRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastLevelRef = useRef<number | null>(null);
  const lastFocusId = useRef<string | null>(null);
  // 프로그래밍적 이동 중임을 나타내는 ref
  const programmaticMovingRef = useRef(false);

  // 내부적으로 사용할 경로/마커 맵
  let mergedVehiclePaths: { [vehicleId: string]: PathPoint[] } = {};
  let mergedVehicleMarkers: { [vehicleId: string]: Marker } = {};

  if (vehiclePaths && Object.keys(vehiclePaths).length > 0) {
    mergedVehiclePaths = vehiclePaths;
  } else if (path && path.length > 0) {
    mergedVehiclePaths = { single: path };
  }

  if (vehicleMarkers && Object.keys(vehicleMarkers).length > 0) {
    mergedVehicleMarkers = vehicleMarkers;
  } else if (markers && markers.length > 0) {
    mergedVehicleMarkers = {};
    markers.forEach((m, idx) => {
      mergedVehicleMarkers[`single${idx}`] = m;
    });
  }

  console.log('[KakaoMap] vehicleMarkers:', vehicleMarkers);
  console.log('[KakaoMap] mergedVehicleMarkers:', mergedVehicleMarkers);

  // 지도 이벤트 등록 (중심/줌 변경 시 저장)
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    const map = mapRef.current;
    const saveCenter = () => {
      const center = map.getCenter();
      lastCenterRef.current = { lat: center.getLat(), lng: center.getLng() };
      lastLevelRef.current = map.getLevel();
    };
    window.kakao.maps.event.addListener(map, 'dragend', saveCenter);
    window.kakao.maps.event.addListener(map, 'zoom_changed', saveCenter);
    return () => {
      window.kakao.maps.event.removeListener(map, 'dragend', saveCenter);
      window.kakao.maps.event.removeListener(map, 'zoom_changed', saveCenter);
    };
  }, []);

  // 지도 객체(mapRef.current)는 최초 1회만 생성
  useEffect(() => {
    const scriptId = 'kakao-map-script';
    const createMap = () => {
      if (!window.kakao || !window.kakao.maps || !mapContainer.current) return;
      if (mapRef.current) return;
      const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
      const map = new window.kakao.maps.Map(mapContainer.current, { center, level: 8 });
      mapRef.current = map;
      if (onMapChange) {
        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          const c = map.getCenter();
          onMapChange({ lat: c.getLat(), lng: c.getLng() }, map.getLevel());
        });
        window.kakao.maps.event.addListener(map, 'dragend', () => {
          const c = map.getCenter();
          onMapChange({ lat: c.getLat(), lng: c.getLng() }, map.getLevel());
        });
      }
    };
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(createMap);
    } else {
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&libraries=services&autoload=false`;
        script.async = true;
        document.head.appendChild(script);
      }
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(createMap);
        }
      };
    }
  }, []);

  // mapCenter, mapLevel 등 props가 바뀔 때마다 지도 상태만 갱신
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    if (mapCenter) {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
    if (mapLevel) {
      mapRef.current.setLevel(mapLevel);
    }
  }, [mapCenter, mapLevel]);

  // 지도 이벤트 등록 (사용자 조작 감지)
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    const map = mapRef.current;
    const onUserMove = () => {
      // 프로그래밍 이동 중에는 무시
      if (programmaticMovingRef.current) return;
      userInteractedRef.current = true;
      if (typeof onUserInteraction === 'function') onUserInteraction();
    };
    window.kakao.maps.event.addListener(map, 'dragstart', onUserMove);
    window.kakao.maps.event.addListener(map, 'zoom_start', onUserMove);
    return () => {
      window.kakao.maps.event.removeListener(map, 'dragstart', onUserMove);
      window.kakao.maps.event.removeListener(map, 'zoom_start', onUserMove);
    };
  }, [onUserInteraction]);

  // 차량 포커스가 있을 때만 부드럽게 이동 (단, 사용자가 직접 지도 이동/줌 이후에는 자동 이동 없음)
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    const map = mapRef.current;
    if (
      vehicleFocusId &&
      mergedVehicleMarkers[vehicleFocusId] &&
      !userInteractedRef.current &&
      programmaticMove // programmaticMove가 true일 때만 이동
    ) {
      const marker = mergedVehicleMarkers[vehicleFocusId];
      const center = new window.kakao.maps.LatLng(marker.lat, marker.lng);
      programmaticMovingRef.current = true;
      map.panTo(center);
      setTimeout(() => {
        programmaticMovingRef.current = false;
      }, 300); // 300ms 후 프로그래밍 이동 해제
    }
  }, [vehicleFocusId, mergedVehicleMarkers, programmaticMove]);

  // vehiclePaths/vehicleMarkers 또는 path/markers가 바뀔 때마다 지도에 경로/마커 다시 그림
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    const map = mapRef.current;

    // 기존 오버레이/폴리라인 제거
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    // 표시할 차량이 없으면 지도 상태 유지(서울로 이동 X), 오버레이 완전 비움
    if (Object.keys(mergedVehiclePaths).length === 0 && Object.keys(mergedVehicleMarkers).length === 0) {
      overlaysRef.current = [];
      return;
    }

    // bounds 계산 (모든 차량의 경로/마커 포함)
    const bounds = new window.kakao.maps.LatLngBounds();
    let hasPoint = false;

    // 모든 차량 경로 그리기 (스타일 개선)
    Object.entries(mergedVehiclePaths).forEach(([vehicleId, p], idx) => {
      const color = getColorByVehicleId(vehicleId, idx);
      if (!disablePolyline && p.length > 1) {
        const linePath = p.map(pt => new window.kakao.maps.LatLng(pt.latitude, pt.longitude));
        const polyline = new window.kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 6,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          map,
        });
        overlaysRef.current.push(polyline);
        linePath.forEach((latlng) => bounds.extend(latlng));
        hasPoint = true;
      } else if (p.length === 1) {
        const latlng = new window.kakao.maps.LatLng(p[0].latitude, p[0].longitude);
        bounds.extend(latlng);
        hasPoint = true;
        const markerKey = vehicleId;
        const marker = mergedVehicleMarkers[markerKey] || {
          lat: p[0].latitude,
          lng: p[0].longitude,
          label: '차량'
        };
        const overlay = new window.kakao.maps.CustomOverlay({
          map,
          position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
          content: '', // 라벨 완전 제거
          yAnchor: 1.5,
        });
        overlaysRef.current.push(overlay);
      }
    });

    // 모든 차량 마커 그리기 (경로와 별개로, 클릭 시 툴팁)
    Object.entries(mergedVehicleMarkers).forEach(([vehicleId, marker], idx) => {
      const color = getColorByVehicleId(vehicleId, idx);
      if (marker.lat && marker.lng) {
        const size = 45; // 원하는 크기

        const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <path d="M23.5 7c.276 0 .5.224.5.5v.511c0 .793-.926.989-1.616.989l-1.086-2h2.202zm-1.441 3.506c.639 1.186.946 2.252.946 3.666 0 1.37-.397 2.533-1.005 3.981v1.847c0 .552-.448 1-1 1h-1.5c-.552 0-1-.448-1-1v-1h-13v1c0 .552-.448 1-1 1h-1.5c-.552 0-1-.448-1-1v-1.847c-.608-1.448-1.005-2.611-1.005-3.981 0-1.414.307-2.48.946-3.666.829-1.537 1.851-3.453 2.93-5.252.828-1.382 1.262-1.707 2.278-1.889 1.532-.275 2.918-.365 4.851-.365s3.319.09 4.851.365c1.016.182 1.45.507 2.278 1.889 1.079 1.799 2.101 3.715 2.93 5.252zm-16.059 2.994c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm10 1c0-.276-.224-.5-.5-.5h-7c-.276 0-.5.224-.5.5s.224.5.5.5h7c.276 0 .5-.224.5-.5zm2.941-5.527s-.74-1.826-1.631-3.142c-.202-.298-.515-.502-.869-.566-1.511-.272-2.835-.359-4.441-.359s-2.93.087-4.441.359c-.354.063-.667.267-.869.566-.891 1.315-1.631 3.142-1.631 3.142 1.64.313 4.309.497 6.941.497s5.301-.184 6.941-.497zm2.059 4.527c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm-18.298-6.5h-2.202c-.276 0-.5.224-.5.5v.511c0 .793.926.989 1.616.989l1.086-2z" fill="${color}"/>
</svg>
`;

        // 차량번호 라벨 표시
        const label = marker.label || '';

        const overlay = new window.kakao.maps.CustomOverlay({
          map,
          position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
          content: `<div style="display:flex;flex-direction:column;align-items:center;">
            ${svgIcon}
            ${label ? `<div style='margin-top:2px;font-size:13px;font-weight:bold;color:${color};background:white;padding:2px 6px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.08);'>${label}</div>` : ''}
          </div>`,
          yAnchor: 1.5,
        });
        overlaysRef.current.push(overlay);
        bounds.extend(new window.kakao.maps.LatLng(marker.lat, marker.lng));
        hasPoint = true;
      }
    });

    // 차량 포커스가 있을 때만 setBounds로 해당 차량이 지도에 잘 보이게 함
    if (vehicleFocusId && hasPoint) {
      map.setBounds(bounds);
    }
    // vehicleFocusId가 없으면 지도 중심/줌은 사용자가 조작한 상태를 그대로 유지
  }, [mergedVehiclePaths, mergedVehicleMarkers, vehicleFocusId, disablePolyline]);

  // mapCenter prop이 바뀔 때마다 지도 중심 이동
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    if (mapCenter && programmaticMove) {
      const map = mapRef.current;
      const center = new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng);
      programmaticMovingRef.current = true;
      map.setCenter(center);
      setTimeout(() => {
        programmaticMovingRef.current = false;
      }, 300);
    }
  }, [mapCenter, programmaticMove]);

  // path만 있을 때 지도 중심과 확대를 경로 전체가 보이도록 자동 조정
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    if (path && path.length > 1 && !mapCenter) {
      const bounds = new window.kakao.maps.LatLngBounds();
      path.forEach(p => bounds.extend(new window.kakao.maps.LatLng(p.latitude, p.longitude)));
      mapRef.current.setBounds(bounds);
    } else if (path && path.length === 1 && !mapCenter) {
      // 한 점만 있을 때는 중심만 이동
      const center = new window.kakao.maps.LatLng(path[0].latitude, path[0].longitude);
      mapRef.current.setCenter(center);
    }
  }, [path, mapCenter]);

  // 외부에서 userInteractedRef 리셋
  React.useEffect(() => {
    if (resetUserInteracted !== undefined) {
      userInteractedRef.current = false;
    }
  }, [resetUserInteracted]);

  // 반응형 스타일 적용
  return <div ref={mapContainer} style={{ width: '100%', height: 'min(70vw, 1000px)', minHeight: 300, borderRadius: '10px' }} />;
};

export default KakaoMap;