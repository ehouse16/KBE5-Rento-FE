import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

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
    const accessToken = localStorage.getItem("AccessToken") || localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("RefreshToken") || localStorage.getItem("refreshToken");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    if (!accessToken) {
      alert("인증 토큰이 없습니다. 다시 로그인해 주세요.");
      localStorage.clear();
      navigate("/manager-login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/managers/logout`, {
        method: "POST",
        headers: {
          AccessToken: accessToken,
          RefreshToken: refreshToken || "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("로그아웃 실패 응답:", errorData);
        throw new Error(`로그아웃 실패: ${response.status}`);
      }

      localStorage.clear();
      setLoginId("");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      localStorage.clear();
      setLoginId("");
      navigate("/manager-login");
    }
  };

  const handleTitleClick = () => {
    navigate("/");
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
