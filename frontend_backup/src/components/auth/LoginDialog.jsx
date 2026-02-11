// frontend/src/components/auth/LoginDialog.jsx
import React from 'react';

function LoginDialog({ onClose, onEmployeeSelect, onMasterSelect }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        <h2 className="text-3xl font-bold text-navy-blue mb-6 text-center">
          Select Login Type
        </h2>
        <div className="space-y-4">
          <button
            onClick={onEmployeeSelect}
            className="w-full bg-capri-blue text-white py-4 rounded-lg text-xl font-semibold hover:bg-cobalt-blue transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Employee Login
          </button>
          <button
            onClick={onMasterSelect}
            className="w-full bg-cobalt-blue text-white py-4 rounded-lg text-xl font-semibold hover:bg-navy-blue transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Master Login
          </button>
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginDialog;