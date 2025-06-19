import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Font Awesome 스타일시트 추가
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 