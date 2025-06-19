// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDx2oWPjyFWMl0opP4RpyfjXPzBaSi_3nc",
  authDomain: "rento-f1d61.firebaseapp.com",
  projectId: "rento-f1d61",
  storageBucket: "rento-f1d61.appspot.com",
  messagingSenderId: "888767906490",
  appId: "1:888767906490:web:d16ed2e7d116d2b888f883",
  measurementId: "G-GC5E5HFXB6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ✅ Data-only payload를 받으면 직접 처리!
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] onBackgroundMessage: ', payload);

  const { title, body, click_action } = payload.data;
  const notificationOptions = {
    body: body,
    icon: '/firebase-logo.png',
    data: { click_action }
  };

  self.registration.showNotification(title, notificationOptions);
});

// ✅ push 이벤트 핸들러: 여기선 중복으로 필요 없음!
// 만약 일부 브라우저 호환 위해 둘 거면 반드시 'data' 기준으로!
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  const payload = event.data.json();

  const title = payload.data?.title || 'Default Title';
  const body = payload.data?.body || 'Default Body';
  const click_action = payload.data?.click_action || '/';

  const notificationOptions = {
    body: body,
    icon: '/firebase-logo.png',
    data: { click_action }
  };

  console.log('[Service Worker] Calling showNotification...');
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// ✅ 알림 클릭 시 URL 이동
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.click_action)
  );
});
