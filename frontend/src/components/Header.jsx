import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import axiosInstance from "../utils/axios";
import { removeFcmToken } from "./firebase/FirebaseToken";

const Header = () => {
  const [loginId, setLoginId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedLoginId = localStorage.getItem("loginId");
    if (storedLoginId) {
      setLoginId(storedLoginId);
    }
  }, []);

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const fcmToken = localStorage.getItem("fcmToken");
  
    if (!accessToken) {
      alert("인증 토큰이 없습니다. 다시 로그인해 주세요.");
      removeFcmToken();
      setLoginId("");
      navigate("/manager-login");
      return;
    }
  
    try {
      // 서버 로그아웃 요청
      const logoutData = {};
      if (fcmToken) {
        logoutData.fcmToken = fcmToken;
        console.log('Logout with FCM token:', fcmToken);
      }
  
      await axiosInstance.post("/api/managers/logout", logoutData);
  
      // ✅ FCM 토큰도 삭제
      removeFcmToken();
      console.log('[FCM] fcmToken removed after logout');
  
      setLoginId("");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
  
      // 에러 발생 시에도 전부 제거
      removeFcmToken();
      console.log('[FCM] fcmToken removed after logout error');
  
      setLoginId("");
      navigate("/manager-login");
    }
  };
  

  const handleTitleClick = () => {
    navigate("/dashboard");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <div onClick={handleTitleClick} style={{ cursor: "pointer" }}>
          <div className={styles.title}>Rento</div>
          <div className={styles.subtitle}>차량 관제 서비스</div>
        </div>
      </div>

      <div className={styles.userInfo}>
        <div className={styles.userName}>{loginId}님, 환영합니다!</div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;