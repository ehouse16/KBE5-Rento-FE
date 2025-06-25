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
}

const KAKAO_MAP_APP_KEY = process.env.REACT_APP_KAKAO_MAP_APP_KEY;

const KakaoMap: React.FC<KakaoMapProps> = ({ vehiclePaths, vehicleMarkers, path, markers }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]); // 오버레이/폴리라인 추적

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

  // 최초 지도 생성
  useEffect(() => {
    const scriptId = 'kakao-map-script';

    const initMap = () => {
      if (!mapContainer.current) return;
      const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
      const map = new window.kakao.maps.Map(mapContainer.current, {
        center,
        level: 8,
      });
      mapRef.current = map;
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
  }, []);

  // vehiclePaths/vehicleMarkers 또는 path/markers가 바뀔 때마다 지도에 경로/마커 다시 그림
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;
    const map = mapRef.current;

    // 기존 오버레이/폴리라인 제거
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

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

    // 지도 bounds 자동 조정 (최초/차량 이동 시)
    if (hasPoint) {
      map.setBounds(bounds);
    }
  }, [mergedVehiclePaths, mergedVehicleMarkers]);

  return <div ref={mapContainer} style={{ width: '100%', height: '1000px', borderRadius: '10px' }} />;
};

export default KakaoMap;