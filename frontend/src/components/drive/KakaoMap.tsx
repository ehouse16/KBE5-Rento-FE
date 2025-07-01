import React, { useEffect, useRef } from 'react';
import { PathPoint } from '../../types/drive';

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
}

const KAKAO_MAP_APP_KEY = process.env.REACT_APP_KAKAO_MAP_APP_KEY;

const KakaoMap: React.FC<KakaoMapProps> = ({ vehiclePaths, vehicleMarkers, path, markers, onMapChange, vehicleFocusId, mapCenter, mapLevel, onUserInteraction, programmaticMove = false, resetUserInteracted }) => {
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

  // 최초 지도 생성 시 마지막 위치로 복원
  useEffect(() => {
    const scriptId = 'kakao-map-script';
    let mapInstance: any = null;
    const initMap = () => {
      if (!mapContainer.current) return;
      let center;
      let level = 8;
      if (mapCenter) {
        center = new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng);
        level = mapLevel || 8;
      } else {
        center = new window.kakao.maps.LatLng(37.5665, 126.9780);
      }
      const map = new window.kakao.maps.Map(mapContainer.current, {
        center,
        level,
      });
      mapRef.current = map;
      mapInstance = map;
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
      window.kakao.maps.load(initMap);
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
          window.kakao.maps.load(initMap);
        }
      };
    }
    // 이벤트 해제
    return () => {
      if (mapInstance && onMapChange) {
        window.kakao.maps.event.removeListener(mapInstance, 'zoom_changed', onMapChange);
        window.kakao.maps.event.removeListener(mapInstance, 'dragend', onMapChange);
      }
    };
  }, [onMapChange, mapCenter, mapLevel]);

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

    // 표시할 차량이 없으면 지도 상태 유지(서울로 이동 X)
    if (Object.keys(mergedVehiclePaths).length === 0 && Object.keys(mergedVehicleMarkers).length === 0) {
      return;
    }

    // bounds 계산 (모든 차량의 경로/마커 포함)
    const bounds = new window.kakao.maps.LatLngBounds();
    let hasPoint = false;

    // 모든 차량 경로 그리기
    Object.values(mergedVehiclePaths).forEach((p, idx) => {
      if (p.length > 1) {
        const linePath = p.map(pt => new window.kakao.maps.LatLng(pt.latitude, pt.longitude));
        const polyline = new window.kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 5,
          strokeColor: '#FF0000',
          strokeOpacity: 0.7,
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
        // 경로가 1개만 있을 때도 마커 추가
        const markerKey = Object.keys(mergedVehiclePaths)[idx];
        const marker = mergedVehicleMarkers[markerKey] || {
          lat: p[0].latitude,
          lng: p[0].longitude,
          label: '차량'
        };
        const overlay = new window.kakao.maps.CustomOverlay({
          map,
          position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
          content: `<div style="padding:4px 8px; background:#1a73e8; color:white; border-radius:4px; font-size:13px; font-weight:bold;">${marker.label || '차량'}</div>`,
          yAnchor: 1.5,
        });
        overlaysRef.current.push(overlay);
      }
    });

    // 모든 차량 마커 그리기 (경로와 별개로)
    Object.values(mergedVehicleMarkers).forEach((marker) => {
      if (marker.lat && marker.lng) {
        const overlay = new window.kakao.maps.CustomOverlay({
          map,
          position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
          content: `<div style="padding:4px 8px; background:#e91e63; color:white; border-radius:4px; font-size:13px; font-weight:bold;">${marker.label || '차량'}</div>`,
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
  }, [mergedVehiclePaths, mergedVehicleMarkers, vehicleFocusId]);

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

  return <div ref={mapContainer} style={{ width: '100%', height: '1000px', borderRadius: '10px' }} />;
};

export default KakaoMap;