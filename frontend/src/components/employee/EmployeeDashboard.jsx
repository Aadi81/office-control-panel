// frontend/src/components/employee/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MyDashboard from './MyDashboard';
import ProjectsClients from './ProjectsClients';
import Files from './Files';
import HelpSupport from './HelpSupport';
import symbol from "./symbol.png";

function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const { emitEmployeeLogout } = useSocket();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    if (user?.id) {
      emitEmployeeLogout(user.id);
    }
    await logout();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: '📊' },
    { id: 'projects', label: 'Projects & Clients', icon: '💼' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'help', label: 'Help & Support', icon: '❓' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-blue via-cobalt-blue to-capri-blue text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src={symbol} alt="logo" className="mx-auto mb-0 w-12"/>
              <h1 className="text-2xl font-bold">TECHWIZER INDIA PVT. LTD.</h1>
              <div className="hidden md:block text-md bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <h2 className="text-3xl font-semibold hidden md:block"> Employee Control Panel (ECP)</h2>
            <button
              onClick={handleLogout}
              className="bg-white text-cobalt-blue px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg">
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3 ${
                  activeMenu === item.id
                    ? 'bg-cobalt-blue text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info Card */}
          <div className="p-6 border-t">
            <div className="bg-gradient-to-br from-capri-blue to-cobalt-blue text-white p-4 rounded-lg">
              <p className="text-sm font-semibold mb-1">Logged in as:</p>
              <p className="text-lg font-bold">{user?.username}</p>
              <p className="text-xs mt-2 opacity-80">{user?.designation}</p>
              <p className="text-xs opacity-80">{user?.department}</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeMenu === 'dashboard' && <MyDashboard />}
          {activeMenu === 'projects' && <ProjectsClients />}
          {activeMenu === 'files' && <Files />}
          {activeMenu === 'help' && <HelpSupport />}
        </main>
      </div>
    </div>
  );
}

export default EmployeeDashboard;