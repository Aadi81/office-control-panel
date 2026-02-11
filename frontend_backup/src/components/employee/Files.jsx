// frontend/src/components/employee/Files.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Files() {
  const [files, setFiles] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(52428800); // 50MB
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/upload/files');
      if (response.data.success) {
        setFiles(response.data.data.files);
        setStorageUsed(response.data.data.storageUsed);
        setStorageLimit(response.data.data.storageLimit);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, JPEG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 52428800) {
      alert('File size must be less than 50MB');
      return;
    }

    // Check if upload would exceed storage limit
    if (storageUsed + file.size > storageLimit) {
      alert('Upload would exceed your 50MB storage limit');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('File uploaded successfully!');
        setSelectedFile(null);
        // Reset file input
        document.getElementById('fileInput').value = '';
        fetchFiles();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await api.delete(`/upload/file/${fileId}`);
      if (response.data.success) {
        alert('File deleted successfully!');
        fetchFiles();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const storagePercentage = (storageUsed / storageLimit) * 100;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading files...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-navy-blue">Files</h2>

      {/* Storage Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-navy-blue">Storage Usage</h3>
          <p className="text-lg font-semibold text-gray-700">
            {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}
          </p>
        </div>
        
        {/* Storage Bar */}
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              storagePercentage > 90 ? 'bg-red-500' :
              storagePercentage > 70 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${storagePercentage}%` }}
          >
            <span className="flex items-center justify-center h-full text-white text-sm font-semibold">
              {storagePercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {storagePercentage > 90 && (
          <p className="mt-2 text-red-600 text-sm font-semibold">
            ⚠️ Warning: You're running out of storage space
          </p>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-navy-blue mb-4">Upload New File</h3>
        <div className="space-y-4">
          <div>
            <input
              id="fileInput"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cobalt-blue file:text-white hover:file:bg-navy-blue cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-2">
              Allowed: JPG, JPEG, PNG, PDF | Max size: 50MB
            </p>
          </div>

          {selectedFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-700">Selected File:</p>
              <p className="text-gray-600">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">Size: {formatFileSize(selectedFile.size)}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-navy-blue mb-4">Uploaded Files ({files.length})</h3>

        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">📁</p>
            <p>No files uploaded yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <div
                key={file._id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-cobalt-blue transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  {/* File Icon */}
                  <div className="text-4xl">
                    {file.fileType.startsWith('image/') ? '🖼️' : '📄'}
                  </div>

                  {/* File Info */}
                  <div>
                    <p className="font-semibold text-gray-800">{file.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.fileSize)} • 
                      Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cobalt-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-navy-blue transition-all text-sm"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Files;


















































