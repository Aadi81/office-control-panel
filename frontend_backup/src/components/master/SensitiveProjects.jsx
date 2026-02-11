// FILE 4: src/components/master/SensitiveProjects.jsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

function SensitiveProjects() {
  const { socket } = useSocket();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    projectName: '',
    projectEngineer: '',
    employeeId: '',
    projectAssignDate: '',
    clientName: '',
    clientDesignation: '',
    contactNo: '',
    emailId: ''
  });

  useEffect(() => {
    fetchProjects();

    if (socket) {
      socket.on('sensitive-project-added', handleProjectUpdate);
    }

    return () => {
      if (socket) {
        socket.off('sensitive-project-added');
      }
    };
  }, [socket]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/master/sensitive-projects');
      if (response.data.success) {
        setProjects(response.data.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectUpdate = () => {
    fetchProjects();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/master/sensitive-project', formData);
      if (response.data.success) {
        alert('Sensitive project added successfully!');
        setFormData({
          companyName: '', projectName: '', projectEngineer: '',
          employeeId: '', projectAssignDate: '', clientName: '',
          clientDesignation: '', contactNo: '', emailId: ''
        });
        setShowForm(false);
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add project');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading sensitive projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-navy-blue">Sensitive Projects</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-capri-blue to-cobalt-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center"
        >
          <span className="text-2xl mr-2">+</span>
          Add Sensitive Project
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-xl font-semibold">No Sensitive Projects</p>
            <p className="text-sm mt-2">Click "Add Sensitive Project" to create master-level projects</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">S.No.</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Company</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Project Name</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Engineer</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Employee ID</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Assign Date</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Client Name</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Client Role</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Contact</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project._id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-3">{index + 1}</td>
                    <td className="px-3 py-3 font-semibold">{project.companyName}</td>
                    <td className="px-3 py-3 font-semibold text-cobalt-blue">{project.projectName}</td>
                    <td className="px-3 py-3">{project.projectEngineer}</td>
                    <td className="px-3 py-3">
                      <span className="bg-cobalt-blue text-white px-2 py-1 rounded text-xs font-semibold">
                        {project.employeeId}
                      </span>
                    </td>
                    <td className="px-3 py-3">{new Date(project.projectAssignDate).toLocaleDateString()}</td>
                    <td className="px-3 py-3">{project.clientName}</td>
                    <td className="px-3 py-3 text-gray-600">{project.clientDesignation}</td>
                    <td className="px-3 py-3">
                      <a href={`tel:${project.contactNo}`} className="text-cobalt-blue hover:underline">
                        {project.contactNo}
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <a href={`mailto:${project.emailId}`} className="text-cobalt-blue hover:underline break-all">
                        {project.emailId}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl w-full my-8">
            <h3 className="text-2xl font-bold text-navy-blue mb-6">Add Sensitive Project</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name *"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="text"
                  name="projectName"
                  placeholder="Project Name *"
                  required
                  value={formData.projectName}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="text"
                  name="projectEngineer"
                  placeholder="Project Engineer Name *"
                  required
                  value={formData.projectEngineer}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="text"
                  name="employeeId"
                  placeholder="Employee ID (e.g., TIPL001) *"
                  required
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="date"
                  name="projectAssignDate"
                  placeholder="Project Assign Date *"
                  required
                  value={formData.projectAssignDate}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="text"
                  name="clientName"
                  placeholder="Client Name *"
                  required
                  value={formData.clientName}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="text"
                  name="clientDesignation"
                  placeholder="Client Designation *"
                  required
                  value={formData.clientDesignation}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="tel"
                  name="contactNo"
                  placeholder="Contact Number *"
                  required
                  value={formData.contactNo}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="email"
                  name="emailId"
                  placeholder="Email ID *"
                  required
                  value={formData.emailId}
                  onChange={handleChange}
                  className="input-field col-span-2"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">ℹ️ About Sensitive Projects:</p>
        <ul className="space-y-1 ml-4">
          <li>• These are master-level projects assigned directly by management</li>
          <li>• Auto-sync with employee and client data from the system</li>
          <li>• Employee ID should match existing employee TIPL IDs</li>
        </ul>
      </div>
    </div>
  );
}

export default SensitiveProjects;
