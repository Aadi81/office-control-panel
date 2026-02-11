// frontend/src/components/employee/MyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function MyDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [loginTime, setLoginTime] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
        setLoginTime(response.data.data.currentLoginTime);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      setAddingTask(true);
      const response = await api.post('/employee/daily-task', {
        taskDescription: newTask
      });

      if (response.data.success) {
        setNewTask('');
        fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const employee = dashboardData?.employee;
  const dailyTasks = dashboardData?.dailyTasks || [];
  const workingDays = dashboardData?.workingDays || [];
  const totalWorkingDays = dashboardData?.totalWorkingDays || 0;

  return (
    <div className="space-y-6">
      {/*Welcoming message to user */}
      <div className="bg-white rounded-lg shadow-md p-6 text-xl">Welcome, <br /> 
        <span className="text-3d" style={{color:"blue",fontSize:"30px"}}>{employee?.fullName}</span> ( {employee?.designation} )
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Information */}
        <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto overflow-x-hidden">

          <h4 className="text-xl font-bold text-navy-blue mb-4 border-b pb-2">Employee Information</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Full Name:</span>
              <p className="text-gray-600">{employee?.fullName}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Office Email:</span>
              <p className="text-gray-600 break-all">{employee?.officeEmail}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Designation:</span>
              <p className="text-gray-600">{employee?.designation}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Department:</span>
              <p className="text-gray-600">{employee?.department}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">TIPL ID:</span>
              <p className="text-gray-600">{employee?.tiplId}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Contact:</span>
              <p className="text-gray-600">{employee?.contactNo}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Month of Joining:</span>
              <p className="text-gray-600">{employee?.monthOfJoining}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Address:</span>
              <p className="text-gray-600 break-words whitespace-pre-line">{employee?.address}</p>
            </div>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-bold text-navy-blue mb-4 border-b pb-2">Daily Tasks</h4>
          
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task..."
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cobalt-blue text-sm"
              />
              <button
                type="submit"
                disabled={addingTask || !newTask.trim()}
                className="bg-cobalt-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-navy-blue disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {addingTask ? '...' : 'Add'}
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dailyTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No tasks added yet</p>
            ) : (
              dailyTasks.map((task) => (
                <div key={task._id} className="bg-gray-50 p-3 rounded border-l-4 border-cobalt-blue">
                  <p className="text-sm text-gray-800">{task.taskDescription}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Working Days */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-bold text-navy-blue mb-4 border-b pb-2">Working Days</h4>
          
          <div className="mb-4">
            <div className="bg-gradient-to-r from-capri-blue to-cobalt-blue text-white p-4 rounded-lg text-center">
              <p className="text-3xl font-bold">{totalWorkingDays}</p>
              <p className="text-sm">Total Working Days</p>
            </div>
          </div>

          {/* Working Days Table */}
          <div className="max-h-80 overflow-y-auto overflow-x-hidden w-full">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-2 py-2 text-left font-semibold text-gray-700">Login</th>
                  <th className="px-2 py-2 text-left font-semibold text-gray-700">Logout</th>
                </tr>
              </thead>
              <tbody>
                {workingDays.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No working days recorded
                    </td>
                  </tr>
                ) : (
                  workingDays.map((day, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2">{formatDate(day.loginTime)}</td>
                      <td className="px-2 py-2 text-green-600 font-mono">{formatTime(day.loginTime)}</td>
                      <td className="px-2 py-2 text-red-600 font-mono">
                        {day.logoutTime ? formatTime(day.logoutTime) : 'Online'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyDashboard;




