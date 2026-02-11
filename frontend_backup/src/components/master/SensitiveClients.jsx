// FILE 3: src/components/master/SensitiveClients.jsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

function SensitiveClients() {
  const { socket } = useSocket();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();

    // Real-time updates when employees add sensitive clients
    if (socket) {
      socket.on('client-added', handleClientUpdate);
      socket.on('sync-data', handleClientUpdate);
    }

    return () => {
      if (socket) {
        socket.off('client-added');
        socket.off('sync-data');
      }
    };
  }, [socket]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/master/sensitive-clients');
      if (response.data.success) {
        setClients(response.data.data.clients);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientUpdate = () => {
    fetchClients(); // Refresh data
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading sensitive clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-navy-blue">Sensitive Clients</h2>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold flex items-center">
          <span className="mr-2">🔒</span>
          {clients.length} Sensitive Clients
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {clients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🔒</p>
            <p className="text-xl font-semibold">No Sensitive Clients</p>
            <p className="text-sm mt-2">Employees haven't marked any clients as sensitive yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Company Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Client Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Designation</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Marked By</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <tr 
                    key={client._id} 
                    className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800">{client.companyName}</td>
                    <td className="px-4 py-3">{client.clientName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{client.clientDesignation}</td>
                    <td className="px-4 py-3 text-sm">
                      <a href={`mailto:${client.clientEmail}`} className="text-cobalt-blue hover:underline">
                        {client.clientEmail}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a href={`tel:${client.clientContact}`} className="text-cobalt-blue hover:underline">
                        {client.clientContact}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-cobalt-blue text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {client.markedByEmployeeId}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">ℹ️ About Sensitive Clients:</p>
        <ul className="space-y-1 ml-4">
          <li>• Clients marked as "sensitive" by employees appear here automatically</li>
          <li>• Real-time sync ensures instant visibility of newly added sensitive clients</li>
          <li>• "Marked By" shows the employee ID who flagged the client</li>
        </ul>
      </div>
    </div>
  );
}

export default SensitiveClients;