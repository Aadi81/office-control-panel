// FILE 1: src/components/master/MasterDashboard.jsx
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MyEmployees from './MyEmployees';
import SensitiveClients from './SensitiveClients';
import SensitiveProjects from './SensitiveProjects';

function MasterDashboard() {
  const { logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('employees');

  const menuItems = [
    { id: 'employees', label: 'My Employees', icon: '👥' },
    { id: 'clients', label: 'Sensitive Clients', icon: '🔒' },
    { id: 'projects', label: 'Sensitive Projects', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-blue via-cobalt-blue to-capri-blue text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Welcome Master</h1>
            <h2 className="text-3xl font-semibold">Master Control Panel (MCP)</h2>
            <button
              onClick={logout}
              className="bg-white text-cobalt-blue px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md"
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
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeMenu === 'employees' && <MyEmployees />}
          {activeMenu === 'clients' && <SensitiveClients />}
          {activeMenu === 'projects' && <SensitiveProjects />}
        </main>
      </div>
    </div>
  );
}

export default MasterDashboard;