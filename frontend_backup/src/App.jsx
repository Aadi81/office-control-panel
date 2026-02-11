// frontend/src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import LandingPage from './components/auth/LandingPage';
import LoginDialog from './components/auth/LoginDialog';
import EmployeeAuth from './components/auth/EmployeeAuth';
import MasterAuth from './components/auth/MasterAuth';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import MasterDashboard from './components/master/MasterDashboard';

function AppContent() {
  const { isAuthenticated, role, loading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-blue via-cobalt-blue to-capri-blue">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return role === 'master' ? <MasterDashboard /> : <EmployeeDashboard />;
  }

  return (
    <>
      <LandingPage onLoginClick={() => setShowLoginDialog(true)} />
      
      {showLoginDialog && !authMode && (
        <LoginDialog
          onClose={() => setShowLoginDialog(false)}
          onEmployeeSelect={() => setAuthMode('employee')}
          onMasterSelect={() => setAuthMode('master')}
        />
      )}
      
      {authMode === 'employee' && (
        <EmployeeAuth onBack={() => setAuthMode(null)} />
      )}
      
      {authMode === 'master' && (
        <MasterAuth onBack={() => setAuthMode(null)} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;






// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import LandingPage from "./components/auth/LandingPage";
// import EmployeeAuth from "./components/auth/EmployeeAuth";
// import MasterAuth from "./components/auth/MasterAuth";

// import EmployeeDashboard from "./components/employee/EmployeeDashboard";
// import MasterDashboard from "./components/master/MasterDashboard";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Public Landing */}
//         <Route path="/" element={<LandingPage />} />

//         {/* Login */}
//         <Route path="/employee/login" element={<EmployeeAuth />} />
//         <Route path="/master/login" element={<MasterAuth />} />

//         {/* Dashboards */}
//         <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
//         <Route path="/master/dashboard" element={<MasterDashboard />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
