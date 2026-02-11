// frontend/src/components/master/MyEmployees.jsx - WITH SEARCH + PROJECTS IN DETAILS
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

function MyEmployees() {
  const { socket } = useSocket();
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // ✅ NEW: Search state

  useEffect(() => {
    fetchEmployees();

    if (socket) {
      socket.on('employee-login', handleEmployeeStatusChange);
      socket.on('employee-logout', handleEmployeeStatusChange);
      socket.on('employee-status-change', handleEmployeeStatusChange);
    }

    return () => {
      if (socket) {
        socket.off('employee-login');
        socket.off('employee-logout');
        socket.off('employee-status-change');
      }
    };
  }, [socket]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/master/employees');
      if (response.data.success) {
        setEmployees(response.data.data.employees);
        setStatistics(response.data.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeStatusChange = () => {
    fetchEmployees();
  };

  // ✅ NEW: Fetch employee details with projects
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await api.get(`/master/employees/${employeeId}`);
      if (response.data.success) {
        setSelectedEmployee(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      alert('Failed to load employee details');
    }
  };

  const getFilteredEmployees = () => {
    let filtered = employees;

    // Apply department/status filter
    switch (filter) {
      case 'active':
        filtered = employees.filter(emp => emp.isActive);
        break;
      case 'inactive':
        filtered = employees.filter(emp => !emp.isActive);
        break;
      case 'Software Development':
      case 'Finance & Legal':
      case 'HR & Sales':
        filtered = employees.filter(emp => emp.department === filter);
        break;
      default:
        filtered = employees;
    }

    // ✅ NEW: Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(emp => 
        emp.tiplId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-xl">Loading...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-navy-blue">My Employees</h2>
        
        {/* ✅ NEW: Search Bar */}
        <div className="flex-1 max-w-md ml-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Company ID (e.g., TIPL001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cobalt-blue"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`card cursor-pointer ${filter === 'all' ? 'ring-2 ring-cobalt-blue' : ''}`}
        >
          <h3 className="text-3xl font-bold text-cobalt-blue">{statistics.totalEmployees || 0}</h3>
          <p className="text-gray-600 font-semibold text-sm">Total Employees</p>
        </button>

        <button
          onClick={() => setFilter('active')}
          className={`card cursor-pointer ${filter === 'active' ? 'ring-2 ring-cobalt-blue' : ''}`}
        >
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-3xl font-bold text-green-600">{statistics.activeEmployees || 0}</h3>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <p className="text-gray-600 font-semibold text-sm">Online</p>
        </button>

        <button
          onClick={() => setFilter('inactive')}
          className={`card cursor-pointer ${filter === 'inactive' ? 'ring-2 ring-cobalt-blue' : ''}`}
        >
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-3xl font-bold text-red-600">{statistics.nonActiveEmployees || 0}</h3>
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          </div>
          <p className="text-gray-600 font-semibold text-sm">Offline</p>
        </button>

        <button
          onClick={() => setFilter('Software Development')}
          className={`card cursor-pointer ${filter === 'Software Development' ? 'ring-2 ring-cobalt-blue' : ''}`}
        >
          <h3 className="text-3xl font-bold text-cobalt-blue">{statistics.softwareTeam || 0}</h3>
          <p className="text-gray-600 font-semibold text-sm">Software Team</p>
        </button>

        <button
          onClick={() => setFilter('Finance & Legal')}
          className={`card cursor-pointer ${filter === 'Finance & Legal' ? 'ring-2 ring-cobalt-blue' : ''}`}
        >
          <h3 className="text-3xl font-bold text-cobalt-blue">{statistics.financeTeam || 0}</h3>
          <p className="text-gray-600 font-semibold text-sm">Finance & Legal Team</p>
        </button>

        <button
          onClick={() => setFilter('HR & Sales')}
          className={`card cursor-pointer ${filter === 'HR & Sales' ? 'ring-2 ring-cobalt-blue' : ''}`}
        >
          <h3 className="text-3xl font-bold text-cobalt-blue">{statistics.hrTeam || 0}</h3>
          <p className="text-gray-600 font-semibold text-sm">HR & Sales Team</p>
        </button>
      </div>

      {/* Filter Info */}
      <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
        <p className="text-gray-700">
          Showing <span className="font-bold">{filteredEmployees.length}</span> employees
          {filter !== 'all' && ` (${filter})`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        {(filter !== 'all' || searchQuery) && (
          <button 
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }} 
            className="text-cobalt-blue font-semibold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-xl">No employees found</p>
            {searchQuery && <p className="text-sm mt-2">Try a different Company ID</p>}
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee._id}
              onClick={() => fetchEmployeeDetails(employee._id)}
              className="card cursor-pointer hover:scale-105 transform transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
                  employee.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  {employee.isActive ? 'Online' : 'Offline'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-navy-blue mb-2">{employee.fullName}</h3>
              <p className="text-gray-600 font-semibold mb-1">{employee.designation}</p>
              <p className="text-sm text-gray-500 mb-3">{employee.tiplId}</p>
              
              <div className="border-t pt-3 space-y-1 text-sm">
                <p className="text-gray-600"><span className="font-semibold">Dept:</span> {employee.department}</p>
                <p className="text-gray-600"><span className="font-semibold">Joined:</span> {employee.monthOfJoining}</p>
                <p className="text-gray-600"><span className="font-semibold">Working Days:</span> {employee.totalWorkingDays}</p>
              </div>

              <button className="mt-4 w-full bg-cobalt-blue text-white py-2 rounded-lg font-semibold hover:bg-navy-blue">
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* ✅ FIXED: Employee Details Modal with Projects and Proper Scrolling */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* ✅ FIXED: Sticky Header */}
            <div className="sticky top-0 bg-white border-b z-10 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-navy-blue">{selectedEmployee.employee.fullName}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                    selectedEmployee.employee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${selectedEmployee.employee.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {selectedEmployee.employee.isActive ? 'Online' : 'Offline'}
                  </span>
                </div>
                <button onClick={() => setSelectedEmployee(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-cobalt-blue border-b pb-2">Personal Information</h4>
                  <div><span className="font-semibold">Full Name:</span> {selectedEmployee.employee.fullName}</div>
                  <div><span className="font-semibold">Designation:</span> {selectedEmployee.employee.designation}</div>
                  <div><span className="font-semibold">Employee ID:</span> {selectedEmployee.employee.tiplId}</div>
                  <div><span className="font-semibold">Department:</span> {selectedEmployee.employee.department}</div>
                  <div><span className="font-semibold">Date of Joining:</span> {selectedEmployee.employee.monthOfJoining}</div>
                  <div><span className="font-semibold">Contact:</span> {selectedEmployee.employee.contactNo}</div>
                  <div><span className="font-semibold">Office Email:</span> {selectedEmployee.employee.officeEmail}</div>
                  <div><span className="font-semibold">Personal Email:</span> {selectedEmployee.employee.personalEmail}</div>
                  <div><span className="font-semibold ">Address:</span> {selectedEmployee.employee.address}</div>
                </div>

                {/* Work Statistics */}
                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-cobalt-blue border-b pb-2">Work Statistics</h4>
                  <div><span className="font-semibold">Projects Assigned:</span> {selectedEmployee.projectsAssigned || 0}</div>
                  <div><span className="font-semibold">Projects Completed:</span> {selectedEmployee.projectsCompleted || 0}</div>
                  <div><span className="font-semibold">Total Working Days:</span> {selectedEmployee.totalWorkingDays || 0}</div>
                  
                  <h4 className="font-bold text-lg text-cobalt-blue border-b pb-2 mt-4">Login Credentials</h4>
                  <div><span className="font-semibold">Username:</span> {selectedEmployee.employee.username}</div>
                  <div><span className="font-semibold">Password:</span> •••••••• (For getting credentials, kindly contact DBM team.)</div>
                </div>
              </div>

              {/* ✅ NEW: Projects Lists */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Projects Assigned */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-cobalt-blue mb-3">
                    Projects Assigned ({selectedEmployee.currentProjects?.length || 0})
                  </h4>
                  {selectedEmployee.currentProjects && selectedEmployee.currentProjects.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.currentProjects.map((project, index) => (
                        <div key={project._id} className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <p className="font-semibold text-sm">
                            {index + 1}. {project.projectName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned: {new Date(project.assignDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No projects assigned</p>
                  )}
                </div>

                {/* Projects Completed */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-green-700 mb-3">
                    Projects Completed ({selectedEmployee.completedProjects?.length || 0})
                  </h4>
                  {selectedEmployee.completedProjects && selectedEmployee.completedProjects.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.completedProjects.map((project, index) => (
                        <div key={project._id} className="bg-white p-3 rounded border-l-4 border-green-500">
                          <p className="font-semibold text-sm">
                            {index + 1}. {project.projectName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Completed: {new Date(project.submissionDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No projects completed yet</p>
                  )}
                </div>
              </div>

              {/* Working Hours History */}
              <div>
                <h4 className="font-bold text-lg text-cobalt-blue border-b pb-2 mb-4">Working Hours History</h4>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Login Time</th>
                        <th className="px-4 py-2 text-left">Logout Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmployee.workingDaysDetails?.slice(0, 20).map((day, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">{day.date}</td>
                          <td className="px-4 py-2 text-green-600">{new Date(day.loginTime).toLocaleTimeString()}</td>
                          <td className="px-4 py-2 text-red-600">
                            {day.logoutTime ? new Date(day.logoutTime).toLocaleTimeString() : 'Online'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ✅ FIXED: Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t p-6">
              <button onClick={() => setSelectedEmployee(null)} className="btn-outline w-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEmployees;

































