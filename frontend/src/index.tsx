import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Font Awesome 스타일시트 추가
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 