import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import CompanyRegisterPage from './components/pages/CompanyRegisterPage';
import ManagerRegisterPage from './components/pages/ManagerRegisterPage';
import ManagerLoginPage from './components/pages/ManagerLoginPage';
import Layout from './components/Layout';
import DashboardPage from './components/pages/DashBoardPage';
import UserManagementPage from './components/pages/UserManagementPage';
import { CompanyProvider } from './contexts/CompanyContext';
import VehicleFleetPage from './components/pages/VehicleFleetPage';
import DriveListPage from './components/pages/DriveListPage';
import DriveDetailPage from './components/drive/DriveDetailPage';
import VehicleDetailPage from './components/vehicle/VehicleDetailPage';
import RealTimeEventPage from './components/pages/RealTimeEventPage';
import FirebaseToken from './components/firebase/FirebaseToken';

function App() {
  return (
    <CompanyProvider>
      <Router>
        <FirebaseToken />
        <Routes>
          {/* 헤더, 사이드바 필요 없는 페이지들 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/company-register" element={<CompanyRegisterPage />} />
          <Route path="/manager-register" element={<ManagerRegisterPage />} />
          <Route path="/manager-login" element={<ManagerLoginPage />} />

          {/* 헤더, 사이드바, 푸터가 필요한 페이지들은 Layout으로 감싸기 */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <DashboardPage />
              </Layout>
            }
          />
          <Route
            path="/users"
            element={
              <Layout>
                <UserManagementPage />
              </Layout>
            }
          />
          <Route path="/vehicles" element={<VehicleFleetPage />} />
          <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
          <Route path="/drives" element={<DriveListPage />} />
          <Route path="/drives/:driveId" element={<DriveDetailPage />} />
          <Route
            path="/realtime-event"
            element={
              <Layout>
                <RealTimeEventPage />
              </Layout>
            }
          />
          {/* 다른 인증 이후 페이지들도 동일하게 Layout 감싸기! */}
        </Routes>
      </Router>
    </CompanyProvider>
  );
}

export default App;
 