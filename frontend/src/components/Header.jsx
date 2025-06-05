// components/Header.jsx
import React from "react";
import styles from "./Header.module.css"; // CSS 모듈 사용 예시

const Header = () => (
  <header className={styles.header}>
    <div className={styles.logoSection}>
      <img src="/logo.svg" alt="FleetPro Logo" className={styles.logo} />
      <div>
        <div className={styles.title}>FleetPro</div>
        <div className={styles.subtitle}>Management Service</div>
      </div>
    </div>
    <div className={styles.rightSection}>
      <button className={styles.exportBtn}>Export</button>
      <button className={styles.newTripBtn}>+ New Trip</button>
      <div className={styles.userInfo}>
        <span className={styles.avatar}>CA</span>
        <div>
          <div className={styles.userName}>Company Admin</div>
          <div className={styles.userEmail}>admin@company.com</div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;