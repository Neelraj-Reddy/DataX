import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Transform = () => {
  const [transforms, setTransforms] = useState([]);
  const [filteredTransforms, setFilteredTransforms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    query: '',
    dependencies: []
  });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '', show: false });

  const API_BASE = '/api/transform';

  // Load transforms on component mount
  useEffect(() => {
    loadTransforms();
  }, []);

  // Filter transforms based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTransforms(transforms);
    } else {
      const filtered = transforms.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.dependencies && t.dependencies.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTransforms(filtered);
    }
  }, [searchTerm, transforms]);

  const loadTransforms = async () => {
    try {
      const response = await fetch(API_BASE);
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
    setFormData({ name: '', query: '', dependencies: [] });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (transform) => {
    setFormData({
      name: transform.name,
      query: transform.query,
      dependencies: transform.dependencies ? transform.dependencies.split(',').map(d => d.trim()) : []
    });
    setEditingId(transform.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transform?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadTransforms();
        showStatus('Transform deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showStatus('Error deleting transform', 'danger');
    }
  };

  const handlePreview = async (transform) => {
    try {
      const response = await fetch(`${API_BASE}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transform.query })
      });
      const data = await response.json();
      
      if (response.ok) {
        // You can implement a modal or expand the card to show preview
        console.log('Preview data:', data);
        showStatus('Preview loaded successfully', 'success');
      } else {
        throw new Error(data.error || 'Preview failed');
      }
    } catch (error) {
      showStatus(`Preview error: ${error.message}`, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate query first
    try {
      const validateResponse = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: formData.query })
      });
      
      if (!validateResponse.ok) {
        const validateData = await validateResponse.json();
        throw new Error(validateData.error || 'Invalid query');
      }
    } catch (error) {
      showStatus(`Query validation failed: ${error.message}`, 'danger');
      return;
    }

    // Save transform
    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          query: formData.query,
          dependencies: formData.dependencies.join(', ')
        })
      });

      if (response.ok) {
        setShowForm(false);
        loadTransforms();
        showStatus(`Transform ${editingId ? 'updated' : 'created'} successfully`, 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save transform');
      }
    } catch (error) {
      showStatus(`Error saving transform: ${error.message}`, 'danger');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: '', query: '', dependencies: [] });
    setEditingId(null);
  };

  return (
    <Layout title="Data Transformations" subtitle="Create and manage your data transformation workflows">
      <div className="d-flex justify-content-end" style={{ marginBottom: 'var(--space-6)' }}>
        <button onClick={handleAddNew} className="btn btn-primary btn-lg">
          <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
          Add Transform
        </button>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label" htmlFor="searchTransforms">
              <i className="fas fa-search" style={{ marginRight: '0.5rem' }}></i>
              Search Transformations
            </label>
            <input 
              type="text" 
              id="searchTransforms" 
              className="form-control" 
              placeholder="Search by name, query, or dependencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.show && (
        <div className={`alert alert-${status.type} mb-4`}>
          {status.message}
        </div>
      )}

      {/* Add/Edit Transform Form */}
      {showForm && (
        <div className="card mb-4 fade-in">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-plus-circle text-accent" style={{ marginRight: '0.5rem' }}></i>
              {editingId ? 'Edit Transform' : 'Add New Transform'}
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="transformName">Transform Name</label>
                <input 
                  type="text" 
                  id="transformName" 
                  className="form-control" 
                  placeholder="Enter transformation name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="transformQuery">SQL Query</label>
                <textarea 
                  id="transformQuery" 
                  rows="6" 
                  className="form-control" 
                  placeholder="SELECT * FROM table WHERE condition..." 
                  value={formData.query}
                  onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">Dependencies</label>
                <div className="bg-card p-3 rounded-lg border border-primary">
                  <p className="text-muted mb-2">Enter comma-separated table/transform names this depends on:</p>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="table1, table2, transform1"
                    value={formData.dependencies.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      dependencies: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                    })}
                  />
                </div>
              </div>
              
              <div className="d-flex justify-content-end" style={{ gap: '1rem' }}>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                  Save Transform
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transforms List */}
      <div className="transforms-grid">
        {filteredTransforms.length === 0 ? (
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-search text-muted" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <h4 className="text-muted">No transforms found</h4>
              <p className="text-muted">
                {searchTerm ? 'Try adjusting your search terms or create a new transform.' : 'Create your first transform to get started.'}
              </p>
            </div>
          </div>
        ) : (
          filteredTransforms.map(transform => (
            <div key={transform.id} className="card fade-in" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="card-title mb-0">
                    <i className="fas fa-exchange-alt text-accent" style={{ marginRight: '0.5rem' }}></i>
                    {transform.name}
                  </h4>
                  <div className="btn-group">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handlePreview(transform)}
                    >
                      <i className="fas fa-eye"></i> Preview
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(transform)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(transform.id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="transform-summary">
                  <p className="text-secondary mb-2">
                    <strong>Dependencies:</strong> {transform.dependencies || 'None'}
                  </p>
                  <div className="bg-secondary p-3 rounded">
                    <code style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {transform.query.substring(0, 200)}
                      {transform.query.length > 200 ? '...' : ''}
                    </code>
                  </div>
                  <div className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                    Created: {new Date(transform.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Transform;