import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Load = () => {
  const [loadProfiles, setLoadProfiles] = useState([]);
  const [transforms, setTransforms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    transform_id: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '', show: false });
  const [uploadProgress, setUploadProgress] = useState({ show: false, progress: 0, status: '' });

  const API_BASE = '/api/load';

  useEffect(() => {
    loadLoadProfiles();
    loadTransforms();
  }, []);

  const loadLoadProfiles = async () => {
    try {
      const response = await fetch(API_BASE);
      const data = await response.json();
      setLoadProfiles(data);
    } catch (error) {
      showStatus('Error loading load profiles', 'danger');
    }
  };

  const loadTransforms = async () => {
    try {
      const response = await fetch('/api/transform');
      const data = await response.json();
      setTransforms(data);
    } catch (error) {
      showStatus('Error loading transforms', 'danger');
    }
  };

  const showStatus = (message, type = 'info', timeout = 3000) => {
    setStatus({ message, type, show: true });
    if (timeout) {
      setTimeout(() => setStatus({ ...status, show: false }), timeout);
    }
  };

  const handleAddNew = () => {
    setFormData({ name: '', transform_id: '', description: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (loadProfile) => {
    setFormData({
      name: loadProfile.name,
      transform_id: loadProfile.transform_id,
      description: loadProfile.description || ''
    });
    setEditingId(loadProfile.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this load profile?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadLoadProfiles();
        showStatus('Load profile deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showStatus('Error deleting load profile', 'danger');
    }
  };

  const handlePreview = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/preview`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Preview data:', data);
        showStatus('Preview loaded successfully', 'success');
        // You can implement a modal to show the preview data
      } else {
        throw new Error(data.error || 'Preview failed');
      }
    } catch (error) {
      showStatus(`Preview error: ${error.message}`, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        loadLoadProfiles();
        showStatus(`Load profile ${editingId ? 'updated' : 'created'} successfully`, 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save load profile');
      }
    } catch (error) {
      showStatus(`Error saving load profile: ${error.message}`, 'danger');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: '', transform_id: '', description: '' });
    setEditingId(null);
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    // Simulate file upload progress
    setUploadProgress({ show: true, progress: 0, status: 'Uploading...' });
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress({ show: true, progress, status: 'Uploading...' });
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress({ show: false, progress: 0, status: '' });
          showStatus('Files uploaded successfully', 'success');
        }, 500);
      }
    }, 200);
  };

  const triggerFileUpload = () => {
    document.getElementById('file-upload').click();
  };

  return (
    <Layout title="Data Loading" subtitle="Configure and manage your data loading processes">
      <div className="d-flex justify-content-end" style={{ marginBottom: 'var(--space-6)' }}>
        <button onClick={handleAddNew} className="btn btn-primary btn-lg">
          <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
          Add Load Profile
        </button>
      </div>

      {/* File Upload Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-cloud-upload-alt text-accent" style={{ marginRight: '0.5rem' }}></i>
            Upload Data Files
          </h3>
        </div>
        <div className="card-body">
          <div 
            className="upload-area" 
            style={{ 
              border: '2px dashed var(--border-primary)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '3rem', 
              textAlign: 'center', 
              background: 'var(--bg-secondary)', 
              cursor: 'pointer' 
            }}
            onClick={triggerFileUpload}
          >
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: 'var(--accent-400)', marginBottom: '1rem' }}></i>
            <h4 className="text-primary mb-3">Drag & Drop Files Here</h4>
            <p className="text-muted mb-3">or click to browse files</p>
            <input 
              type="file" 
              id="file-upload" 
              multiple 
              accept=".csv,.json,.xlsx,.sql" 
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button className="btn btn-secondary" onClick={triggerFileUpload}>
              <i className="fas fa-folder-open" style={{ marginRight: '0.5rem' }}></i>
              Browse Files
            </button>
            <p className="text-muted mt-3" style={{ fontSize: '0.875rem' }}>
              Supported formats: CSV, JSON, XLSX, SQL
            </p>
          </div>
          
          {uploadProgress.show && (
            <div style={{ marginTop: '1rem' }}>
              <div className="progress" style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    background: 'var(--gradient-primary)', 
                    width: `${uploadProgress.progress}%`,
                    transition: 'width 0.3s ease' 
                  }}
                ></div>
              </div>
              <p className="text-muted mt-2">{uploadProgress.status} {uploadProgress.progress}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {status.show && (
        <div className={`alert alert-${status.type} mb-4`}>
          {status.message}
        </div>
      )}

      {/* Add/Edit Load Form */}
      {showForm && (
        <div className="card mb-4 fade-in">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-plus-circle text-accent" style={{ marginRight: '0.5rem' }}></i>
              {editingId ? 'Edit Load Profile' : 'Add Load Profile'}
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="loadName">Profile Name</label>
                <input 
                  type="text" 
                  id="loadName" 
                  className="form-control" 
                  placeholder="Enter load profile name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="transformSelect">Source Transform</label>
                <select 
                  id="transformSelect" 
                  className="form-control" 
                  value={formData.transform_id}
                  onChange={(e) => setFormData({ ...formData, transform_id: e.target.value })}
                  required
                >
                  <option value="">Select a transform...</option>
                  {transforms.map(transform => (
                    <option key={transform.id} value={transform.id}>
                      {transform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="loadDescription">Description (Optional)</label>
                <textarea 
                  id="loadDescription" 
                  className="form-control" 
                  rows="3" 
                  placeholder="Enter load profile description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              
              <div className="d-flex justify-content-end" style={{ gap: '1rem' }}>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                  Save Load Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Load Profiles List */}
      <div className="load-profiles-grid">
        {loadProfiles.length === 0 ? (
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-database text-muted" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <h4 className="text-muted">No load profiles found</h4>
              <p className="text-muted">Create your first load profile to get started.</p>
            </div>
          </div>
        ) : (
          loadProfiles.map(loadProfile => (
            <div key={loadProfile.id} className="card fade-in" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="card-title mb-0">
                    <i className="fas fa-upload text-primary" style={{ marginRight: '0.5rem' }}></i>
                    {loadProfile.name}
                  </h4>
                  <div className="btn-group">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handlePreview(loadProfile.id)}
                    >
                      <i className="fas fa-eye"></i> Preview
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(loadProfile)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(loadProfile.id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <p className="text-secondary mb-2">
                  <strong>Transform:</strong> {loadProfile.transform_name || 'N/A'}
                </p>
                {loadProfile.description && (
                  <p className="text-muted mb-2">{loadProfile.description}</p>
                )}
                <div className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                  Created: {new Date(loadProfile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Load;