// frontend/src/components/auth/EmployeeAuth.jsx - WITH TIPL VALIDATION
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

function EmployeeAuth({ onBack }) {
  const { login } = useAuth();
  const { emitEmployeeLogin } = useSocket();
  const [isSignUp, setIsSignUp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', officeEmail: '', designation: '', dateOfBirth: '',
    monthOfJoining: '', department: '', tiplId: '', contactNo: '',
    personalEmail: '', address: '', username: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ NEW: TIPL ID Validation Function
  const validateTIPLId = (tiplId) => {
    // Format: TIPL20XXXXX where XXXXX is 14001-99999
    const tiplPattern = /^TIPL[0-9]{7}$/;
    return tiplPattern.test(tiplId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ NEW: Validate TIPL ID before submission
      if (isSignUp && !validateTIPLId(formData.tiplId)) {
        setError('Invalid Company ID!');
        setLoading(false);
        return;
      }

      if (isSignUp && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const endpoint = isSignUp ? '/auth/employee/signup' : '/auth/employee/signin';
      const payload = isSignUp ? formData : { 
        username: formData.username, 
        password: formData.password 
      };

      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        login(res.data.token, res.data.user, 'employee');
        emitEmployeeLogin(res.data.user.id);
      } else {
        setError(res.data.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    }
    setLoading(false);
  };

  if (isSignUp === null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-navy-blue mb-6 text-center">Employee Access</h2>
          <div className="space-y-4">
            <button onClick={() => setIsSignUp(true)} className="w-full bg-capri-blue text-white py-4 rounded-lg text-xl font-semibold hover:bg-cobalt-blue transition-all">
              Sign Up (New Employee)
            </button>
            <button onClick={() => setIsSignUp(false)} className="w-full bg-cobalt-blue text-white py-4 rounded-lg text-xl font-semibold hover:bg-navy-blue transition-all">
              Sign In (Existing Employee)
            </button>
            <button onClick={onBack} className="w-full border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
          <h2 className="text-3xl font-bold text-navy-blue text-center">
            {isSignUp ? 'Employee Sign Up' : 'Employee Sign In'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp ? (
            <> <div> 
                <span style={{color:"red",fontSize: "11px",fontWeight: "bold"}}>*in capital letter</span>
                  <input 
                    name="fullName" 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    className="input-field" 
                    onChange={handleChange} 
                  />
               </div>
              
              <input 
                name="officeEmail" 
                type="email" 
                placeholder="Office Email" 
                required 
                className="input-field" 
                onChange={handleChange} 
              />
              
              <input 
                name="designation" 
                type="text" 
                placeholder="Designation" 
                required 
                className="input-field" 
                onChange={handleChange} 
              />
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input 
                  name="dateOfBirth" 
                  type="date" 
                  required 
                  className="input-field" 
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <input 
                name="monthOfJoining" 
                type="text" 
                placeholder="Year and Month of Joining (e.g., 2014, December)" 
                required 
                className="input-field" 
                onChange={handleChange} 
              />
              
              <select 
                name="department" 
                required 
                className="input-field" 
                onChange={handleChange}
                defaultValue=""
              >
                <option value="" disabled>Select Department</option>
                <option value="Software Development">Software Development</option>
                <option value="Finance & Legal">Finance & Legal</option>
                <option value="HR & Sales">HR & Sales</option>
              </select>
              
              {/* ✅ MODIFIED: TIPL ID with validation */}
              <div> <span style={{color:"red",fontSize: "11px",fontWeight: "bold"}}>*mandatory to fill</span>
                <input 
                  name="tiplId" 
                  type="text" 
                  placeholder="Your Company ID No." 
                  required 
                  className="input-field" 
                  onChange={handleChange}
                  // pattern="TIPL(0[0-9]{2}|[1-9][0-9]{2})"
                  pattern="^TIPL[0-9]{7}$"
                 
                />
                <p className="text-xs text-gray-500 mt-1">
                  
                </p>
              </div>
              
              <input 
                name="contactNo" 
                type="tel" 
                placeholder="Contact Number" 
                required 
                className="input-field" 
                onChange={handleChange}
                pattern="[0-9]{10}"
                title="Please enter 10 digit mobile number"
              />
              
              <input 
                name="personalEmail" 
                type="email" 
                placeholder="Personal Email" 
                required 
                className="input-field" 
                onChange={handleChange} 
              />
              
              
              <textarea
                name="address"
                placeholder="Full Address"
                required
                className="input-field"
                rows="3"
                onChange={handleChange}
              />
              
              <input 
                name="username" 
                type="text" 
                placeholder="Username (for login)" 
                required 
                className="input-field" 
                onChange={handleChange}
                minLength="4"
              />
              <div>
              <span style={{color:"red",fontSize: "11px",fontWeight: "bold"}}>*minimum 6 character</span>
              <input 
                name="password" 
                type="password" 
                placeholder="Password (minimum 6 characters)" 
                required 
                className="input-field" 
                onChange={handleChange}
                minLength="6"
              />
              </div>
              
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm Password" 
                required 
                className="input-field" 
                onChange={handleChange}
                minLength="6"
              />
            </>
          ) : (
            <>
              <input 
                name="username" 
                type="text" 
                placeholder="Username" 
                required 
                className="input-field" 
                onChange={handleChange} 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                required 
                className="input-field" 
                onChange={handleChange} 
              />
            </>
          )}
          
          <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t">
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsSignUp(null)} 
                className="btn-outline flex-1"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Save & Login' : 'Login')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeAuth;