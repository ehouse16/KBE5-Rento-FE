import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import CompanyRegisterPage from './components/pages/CompanyRegisterPage';
import ManagerRegisterPage from './components/pages/ManagerRegisterPage';
import ManagerLoginPage from './components/pages/ManagerLoginPage';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/company/register" element={<CompanyRegisterPage />} />
        <Route path="/manager/register" element={<ManagerRegisterPage />} />
        <Route path="/manager/login" element={<ManagerLoginPage />} />
      </Routes>
    </Router>
  );
};

export default App; 