// frontend/src/components/auth/LandingPage.jsx
import React from 'react';
import logo from "./logoOCP.png";

function LandingPage({ onLoginClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-blue via-cobalt-blue to-capri-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center animate-fade-in">
         
        <img src={logo} alt="logoimage" className="mx-auto mb-10 w-80"/>
        <p className="text-5xl text-cobalt-blue mb-10 font-bold">
          Office Control Panel
        </p>
        <p className="text-gray-600 mb-8 text-xl">
          Employee Management & Project Tracking System
        </p>
        <button
          onClick={onLoginClick}
          className="bg-cobalt-blue text-white px-12 py-4 rounded-xl text-xl font-bold hover:bg-navy-blue transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
        >
          Login to Dashboard
        </button>
        <div className="mt-8 text-sm text-gray-500">
          <p>© 2026 Techwizer India Private Limited</p>
          <p>Lucknow, Uttar Pradesh, India</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;