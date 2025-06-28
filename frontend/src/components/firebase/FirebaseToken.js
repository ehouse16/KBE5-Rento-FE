// src/components/firebase/FirebaseToken.js
import React, { useEffect } from 'react';
import { messaging, getToken } from '../../firebase-messaging';

export const removeFcmToken = () => {
    sessionStorage.removeItem('fcmToken');
    sessionStorage.removeItem('fcmTokenChanged');
};

const FirebaseToken = () => {
    useEffect(() => {
        const requestPermission = async () => {
            const generateNewToken = async () => {
                try {
                    let registration = undefined;
                    if ('serviceWorker' in navigator) {
                        registration = await navigator.serviceWorker.ready;
                    }
                    const currentToken = await getToken(messaging, {
                        vapidKey: 'BG7il3gQ_UrQKlQbad2rPIBADGH7ojKUTZ8eIB6-d6M1rHDahUnz08XCfr3p98r2q5C3_snmAbdLwaBZ7qgFbhY',
                        serviceWorkerRegistration: registration
                    });
                    if (currentToken) {
                        // 기존 토큰과 비교
                        const existingToken = sessionStorage.getItem('fcmToken');
                        if (existingToken !== currentToken) {
                            sessionStorage.setItem('fcmToken', currentToken);
                            sessionStorage.setItem('fcmTokenChanged', 'true');
                            window.dispatchEvent(new CustomEvent('fcmTokenUpdated', { detail: { token: currentToken } }));
                            console.log('[FCM] FCM Token generated/refreshed:', currentToken);
                        }
                        return currentToken;
                    } else {
                        setTimeout(() => {
                            generateNewToken();
                        }, 2000);
                        return null;
                    }
                } catch (error) {
                    console.error('[FCM] Error getting FCM token:', error);
                    setTimeout(() => {
                        generateNewToken();
                    }, 3000);
                    return null;
                }
            };

            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await generateNewToken();
                }
            } else if (Notification.permission === 'granted') {
                await generateNewToken();
            }
        };

        requestPermission();
        
        const handleFocus = () => {
            const currentToken = sessionStorage.getItem('fcmToken');
            if (!currentToken) {
                requestPermission();
            }
        };
        
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                const currentToken = sessionStorage.getItem('fcmToken');
                if (!currentToken) {
                    requestPermission();
                }
            }
        };
        
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return null;
};

export default FirebaseToken;