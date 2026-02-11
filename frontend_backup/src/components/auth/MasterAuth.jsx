// FILE: src/components/auth/MasterAuth.jsx
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

function MasterAuth({ onBack }) {
  const { login } = useAuth();
  const { emitMasterLogin } = useSocket();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/master/signin', credentials);

      if (res.data.success) {
        login(res.data.token, res.data.user, 'master');
        emitMasterLogin();
      } else {
        setError(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-navy-blue mb-6 text-center">Master Login</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Username" 
            required 
            className="input-field" 
            onChange={(e) => setCredentials({...credentials, username: e.target.value})} 
          />
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              required 
              className="input-field pr-12" 
              onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onBack} className="btn-outline flex-1">Back</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MasterAuth;