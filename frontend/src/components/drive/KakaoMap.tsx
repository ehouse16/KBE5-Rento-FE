import React, { useEffect, useRef } from 'react';
import { PathPoint } from '../../types/drive';

// 카카오맵 API가 window 객체에 전역으로 등록되므로, 타입 선언이 필요합니다.
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  path: PathPoint[];
}

const KAKAO_MAP_APP_KEY = process.env.REACT_APP_KAKAO_MAP_APP_KEY;

const KakaoMap: React.FC<KakaoMapProps> = ({ path }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!path || path.length < 2) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:grey; font-weight:bold;">경로 데이터가 부족하여 지도를 표시할 수 없습니다.</div>`;
      }
      return;
    }

    const scriptId = 'kakao-map-script';

    const initMap = () => {
      if (!mapContainer.current) return;
      
      const linePath = path.map(p => new window.kakao.maps.LatLng(p.latitude, p.longitude));
      const mapOption = {
        center: linePath[Math.floor(linePath.length / 2)],
        level: 8,
      };
      const map = new window.kakao.maps.Map(mapContainer.current, mapOption);

      const startPosition = linePath[0];
      const endPosition = linePath[linePath.length - 1];
      
      // '출발' 지점을 나타내는 커스텀 오버레이
      new window.kakao.maps.CustomOverlay({
        map: map,
        position: startPosition,
        content: `
          <div style="padding: 6px 10px; background-color: #1a73e8; color: white; border-radius: 5px; font-size: 14px; font-weight: bold; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            출발
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #1a73e8;"></div>
          </div>
        `,
        yAnchor: 1.5
      });

      // '도착' 지점을 나타내는 커스텀 오버레이
      new window.kakao.maps.CustomOverlay({
        map: map,
        position: endPosition,
        content: `
          <div style="padding: 6px 10px; background-color: #1a73e8; color: white; border-radius: 5px; font-size: 14px; font-weight: bold; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            도착
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #1a73e8;"></div>
          </div>
        `,
        yAnchor: 1.5
      });

      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#FF0000',
        strokeOpacity: 0.7,
        strokeStyle: 'solid',
      });
      polyline.setMap(map);

      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach(point => bounds.extend(point));
      map.setBounds(bounds);
    };

    // 스크립트가 이미 로드되어 window.kakao 객체가 사용 가능한 경우
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    } else {
      // 스크립트 태그를 찾아서, 없다면 새로 생성
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&libraries=services&autoload=false`;
        script.async = true;
        document.head.appendChild(script);
      }
      // 스크립트 로드가 완료되면 initMap 실행
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(initMap);
        }
      };
    }
  }, [path]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px', borderRadius: '10px' }} />;
};

export default KakaoMap; 