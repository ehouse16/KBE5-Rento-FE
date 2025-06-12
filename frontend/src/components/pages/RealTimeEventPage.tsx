import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface EventData {
  id: number;
  [key: string]: any;
}

const API_URL = 'https://api.rento.world/api/events/cycle-info/get-list';

const RealTimeEventPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      fetchEvents(); // 버튼 누르자마자 1회 호출
      intervalRef.current = setInterval(fetchEvents, 10000);
    } else {
      setEvents([]); // 중지 시 이벤트 초기화
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(API_URL);
      setEvents(res.data); // 새 데이터로만 갱신
    } catch (err) {
      console.error('이벤트 데이터 불러오기 실패:', err);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>실시간 이벤트</h2>
      {!isRunning ? (
        <button onClick={handleStart} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          실행
        </button>
      ) : (
        <ul style={{ maxHeight: '60vh', overflowY: 'auto', background: '#f9f9f9', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
          {events.length === 0 && <li>이벤트가 없습니다.</li>}
          {events.map((event, idx) => (
            <li key={event.id || idx} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', fontSize: '0.9rem' }}>
              {Object.entries(event).map(([key, value]) => (
                <span key={key} style={{ marginRight: '1rem' }}><b>{key}:</b> {String(value)} </span>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RealTimeEventPage;
