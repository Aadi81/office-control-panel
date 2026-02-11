// frontend/src/components/employee/ProjectsClients.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function ProjectsClients() {
  const [currentProjects, setCurrentProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(null);
  const [showCompletedList, setShowCompletedList] = useState(false);

  const [projectForm, setProjectForm] = useState({ projectName: '', workAndRole: '' });
  const [clientForm, setClientForm] = useState({
    companyName: '', clientName: '', clientDesignation: '',
    clientEmail: '', clientContact: '', isSensitive: false
  });
  const [completeForm, setCompleteForm] = useState({ remarks: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/employee/projects'),
        api.get('/employee/clients')
      ]);

      if (projectsRes.data.success) {
        setCurrentProjects(projectsRes.data.data.currentProjects);
        setCompletedProjects(projectsRes.data.data.completedProjects);
      }

      if (clientsRes.data.success) {
        setClients(clientsRes.data.data.clients);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/employee/project', projectForm);
      if (res.data.success) {
        setProjectForm({ projectName: '', workAndRole: '' });
        setShowProjectForm(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add project');
    }
  };

  const handleCompleteProject = async (projectId) => {
    try {
      const res = await api.put(`/employee/project/${projectId}/complete`, completeForm);
      if (res.data.success) {
        setCompleteForm({ remarks: '' });
        setShowProjectDetails(null);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete project');
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/employee/client', clientForm);
      if (res.data.success) {
        setClientForm({
          companyName: '', clientName: '', clientDesignation: '',
          clientEmail: '', clientContact: '', isSensitive: false
        });
        setShowClientForm(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add client');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-xl text-gray-600">Loading...</p></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-navy-blue">Projects & Clients</h2>

      {/* Four Main Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Projects */}
        <button
          onClick={() => currentProjects.length > 0 && setShowProjectDetails(currentProjects[0])}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all cursor-pointer text-left"
        >
          <h3 className="text-4xl font-bold text-cobalt-blue mb-2">{currentProjects.length}</h3>
          <p className="text-gray-600 font-semibold">Current Projects</p>
        </button>

        {/* Completed Projects */}
        <button
          onClick={() => setShowCompletedList(true)}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all cursor-pointer text-left"
        >
          <h3 className="text-4xl font-bold text-green-600 mb-2">{completedProjects.length}</h3>
          <p className="text-gray-600 font-semibold">Projects Completed</p>
        </button>

        {/* Clients */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-cobalt-blue mb-2">Clients</h3>
          <p className="text-gray-600 font-semibold mb-4">{clients.length} Total</p>
          <button
            onClick={() => setShowClientForm(true)}
            className="w-full bg-capri-blue text-white py-2 rounded-lg font-semibold hover:bg-cobalt-blue transition-all"
          >
            View/Add Clients
          </button>
        </div>

        {/* Add New Project */}
        <button
          onClick={() => setShowProjectForm(true)}
          className="bg-gradient-to-br from-capri-blue to-cobalt-blue text-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all flex flex-col items-center justify-center"
        >
          <span className="text-5xl mb-2">+</span>
          <p className="font-bold text-lg">Add New Project</p>
        </button>
      </div>

      {/* Current Projects List */}
      {currentProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-navy-blue mb-4">Current Projects List</h3>
          <div className="grid gap-4">
            {currentProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => setShowProjectDetails(project)}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-cobalt-blue cursor-pointer transition-all"
              >
                <h4 className="font-bold text-lg text-cobalt-blue">{project.projectName}</h4>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.workAndRole}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Assigned: {new Date(project.assignDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-navy-blue mb-6">Add New Project</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <input
                type="text"
                placeholder="Project Name"
                required
                value={projectForm.projectName}
                onChange={(e) => setProjectForm({...projectForm, projectName: e.target.value})}
                className="input-field"
              />
              <textarea
                placeholder="Explain your work and role (max 500 words)"
                required
                rows="6"
                maxLength="500"
                value={projectForm.workAndRole}
                onChange={(e) => setProjectForm({...projectForm, workAndRole: e.target.value})}
                className="input-field"
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowProjectForm(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-navy-blue mb-6">Project Details</h3>
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">Project Name:</label>
                <p className="text-gray-600">{showProjectDetails.projectName}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Work and Role:</label>
                <p className="text-gray-600">{showProjectDetails.workAndRole}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Assign Date:</label>
                <p className="text-gray-600">{new Date(showProjectDetails.assignDate).toLocaleDateString()}</p>
              </div>

              {showProjectDetails.status === 'current' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="font-semibold text-gray-700 block mb-2">Complete this project?</label>
                  <textarea
                    placeholder="Any remarks for the project (max 500 words)"
                    rows="4"
                    maxLength="500"
                    value={completeForm.remarks}
                    onChange={(e) => setCompleteForm({remarks: e.target.value})}
                    className="input-field mb-4"
                  />
                  <button
                    onClick={() => handleCompleteProject(showProjectDetails._id)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button onClick={() => setShowProjectDetails(null)} className="btn-outline flex-1">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Projects List Modal */}
      {showCompletedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-navy-blue mb-6">Completed Projects</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">S.No.</th>
                    <th className="px-4 py-3 text-left">Project Name</th>
                    <th className="px-4 py-3 text-left">Assign Date</th>
                    <th className="px-4 py-3 text-left">Completion Date</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {completedProjects.map((project, index) => (
                    <tr key={project._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold">{project.projectName}</td>
                      <td className="px-4 py-3">{new Date(project.assignDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{new Date(project.submissionDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{project.remarks || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setShowCompletedList(false)} className="btn-outline mt-6">Close</button>
          </div>
        </div>
      )}

      {/* Client Form/List Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">

            <h3 className="text-2xl font-bold text-navy-blue mb-6">Clients Management</h3>
            
            {/* Add Client Form */}
            <form onSubmit={handleAddClient} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-lg mb-4">Add New Client</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Company Name" required value={clientForm.companyName} onChange={(e) => setClientForm({...clientForm, companyName: e.target.value})} className="input-field" />
                <input type="text" placeholder="Client Name" required value={clientForm.clientName} onChange={(e) => setClientForm({...clientForm, clientName: e.target.value})} className="input-field" />
                <input type="text" placeholder="Client Designation" required value={clientForm.clientDesignation} onChange={(e) => setClientForm({...clientForm, clientDesignation: e.target.value})} className="input-field" />
                <input type="email" placeholder="Client Email" required value={clientForm.clientEmail} onChange={(e) => setClientForm({...clientForm, clientEmail: e.target.value})} className="input-field" />
                <input type="tel" placeholder="Client Contact" required value={clientForm.clientContact} onChange={(e) => setClientForm({...clientForm, clientContact: e.target.value})} className="input-field" />
                <div className="flex items-center space-x-4">
                  <label className="font-semibold">Sensitive Client:</label>
                  <label className="flex items-center">
                    <input type="radio" name="sensitive" checked={clientForm.isSensitive === true} onChange={() => setClientForm({...clientForm, isSensitive: true})} className="mr-2" />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="sensitive" checked={clientForm.isSensitive === false} onChange={() => setClientForm({...clientForm, isSensitive: false})} className="mr-2" />
                    No
                  </label>
                </div>
              </div>
              <button type="submit" className="btn-primary mt-4">Add Client</button>
            </form>

            {/* Clients List */}
            <div>
              <h4 className="font-bold text-lg mb-4">All Clients</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Designation</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left">Sensitive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{client.companyName}</td>
                        <td className="px-4 py-3">{client.clientName}</td>
                        <td className="px-4 py-3">{client.clientDesignation}</td>
                        <td className="px-4 py-3">{client.clientEmail}</td>
                        <td className="px-4 py-3">{client.clientContact}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${client.isSensitive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {client.isSensitive ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={() => setShowClientForm(false)} className="btn-outline mt-6">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsClients;