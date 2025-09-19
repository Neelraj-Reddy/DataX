// Helper: API base URL
const API_BASE = '/api/load';

const loadsList = document.getElementById('loads-list');
const addBtn = document.getElementById('add-load-btn');
const formDiv = document.getElementById('add-load-form');
const form = document.getElementById('load-form');
const cancelBtn = document.getElementById('cancel-btn');
const transformSelect = document.getElementById('transform-select');
const fileUpload = document.getElementById('file-upload');
const uploadProgress = document.getElementById('upload-progress');

// Status message
let statusDiv = document.getElementById('status-message');
if (!statusDiv) {
  statusDiv = document.createElement('div');
  statusDiv.id = 'status-message';
  statusDiv.className = 'mb-4';
  document.querySelector('.main-content').appendChild(statusDiv);
}

function showStatus(msg, type = 'info', timeout = 3000) {
  const alertClass = type === 'info' ? 'alert-info' : 
                   type === 'success' ? 'alert-success' : 
                   type === 'warning' ? 'alert-warning' : 'alert-danger';
  statusDiv.innerHTML = `<div class="alert ${alertClass} mb-3">${msg}</div>`;
  if (timeout) setTimeout(() => { statusDiv.innerHTML = ''; }, timeout);
}

// Global loads array
let allLoads = [];

// File upload functionality
if (fileUpload) {
  fileUpload.addEventListener('change', handleFileUpload);
}

// Drag and drop functionality
const uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent-primary)';
    uploadArea.style.background = 'rgba(100, 181, 246, 0.1)';
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border-primary)';
    uploadArea.style.background = 'var(--bg-secondary)';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border-primary)';
    uploadArea.style.background = 'var(--bg-secondary)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  });
}

function handleFileUpload(event) {
  const files = event.target.files;
  if (files.length > 0) {
    handleFiles(files);
  }
}

function handleFiles(files) {
  if (!uploadProgress) return;
  
  uploadProgress.style.display = 'block';
  const progressBar = uploadProgress.querySelector('.progress-bar');
  const statusText = document.getElementById('upload-status');
  
  let completed = 0;
  const total = files.length;
  
  Array.from(files).forEach((file, index) => {
    // Simulate file upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        completed++;
        
        if (completed === total) {
          setTimeout(() => {
            uploadProgress.style.display = 'none';
            showStatus(`Successfully uploaded ${total} file(s)`, 'success');
            // Refresh data sources or transforms list
            loadTransforms();
          }, 500);
        }
      }
      
      const overallProgress = ((completed * 100) + progress) / total;
      progressBar.style.width = overallProgress + '%';
      statusText.textContent = `Uploading ${file.name}... ${Math.round(progress)}%`;
    }, 100);
  });
}

function renderLoads() {
  if (!allLoads.length) {
    loadsList.innerHTML = `
      <div class="card text-center">
        <div class="card-body">
          <i class="fas fa-upload text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h4 class="text-muted">No load profiles found</h4>
          <p class="text-muted">Create your first load profile to get started.</p>
          <button class="btn btn-primary" onclick="addBtn.click()">
            <i class="fas fa-plus" style="margin-right: 0.5rem;"></i>
            Create Load Profile
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  loadsList.innerHTML = allLoads.map(l => `
    <div class="card fade-in" data-id="${l.id}" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="card-title mb-0">
            <i class="fas fa-upload text-accent" style="margin-right: 0.5rem;"></i>
            ${l.name}
          </h4>
          <div class="btn-group">
            <button class="btn btn-sm btn-secondary preview-btn">
              <i class="fas fa-eye"></i> Preview
            </button>
            <button class="btn btn-sm btn-danger delete-btn">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="load-summary">
          <p class="text-secondary mb-3">
            <strong>Source Transform:</strong> 
            <span class="badge badge-primary">${l.transform_name || 'None'}</span>
          </p>
          ${l.description ? `<p class="text-muted mb-2">${l.description}</p>` : ''}
          <div class="load-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div class="text-center">
              <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-blue);">
                <i class="fas fa-clock"></i>
              </div>
              <p class="text-muted mb-0" style="font-size: 0.875rem;">Last Updated</p>
              <p class="text-secondary mb-0">${new Date(l.created_at).toLocaleDateString()}</p>
            </div>
            <div class="text-center">
              <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-green);">
                <i class="fas fa-check-circle"></i>
              </div>
              <p class="text-muted mb-0" style="font-size: 0.875rem;">Status</p>
              <p class="text-secondary mb-0">Active</p>
            </div>
          </div>
        </div>
        <div class="load-details" style="display:none;"></div>
      </div>
    </div>
  `).join('');

  // Add event listeners for action buttons
  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.onclick = async function() {
      const card = btn.closest('.card');
      const id = card.getAttribute('data-id');
      const l = allLoads.find(x => x.id == id);
      const detailsDiv = card.querySelector('.load-details');
      
      if (detailsDiv.style.display === 'none') {
        detailsDiv.innerHTML = `
          <div class="mt-4">
            <h5 class="text-primary mb-3">
              <i class="fas fa-table" style="margin-right: 0.5rem;"></i>
              Load Preview
            </h5>
            <div class="preview-results">
              <div class="d-flex align-items-center mb-3">
                <div class="loading" style="margin-right: 0.75rem;"></div>
                <span>Loading preview data...</span>
              </div>
            </div>
          </div>
        `;
        detailsDiv.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
        
        // Load preview data
        try {
          const res = await fetch(`${API_BASE}/${id}/preview`);
          const data = await res.json();
          const resultsDiv = detailsDiv.querySelector('.preview-results');
          
          if (res.ok && data.rows && data.rows.length) {
            const cols = Object.keys(data.rows[0]);
            let html = `
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
                  </thead>
                  <tbody>
                    ${data.rows.slice(0, 10).map(row => 
                      '<tr>' + cols.map(c => `<td>${row[c] || ''}</td>`).join('') + '</tr>'
                    ).join('')}
                  </tbody>
                </table>
              </div>
            `;
            if (data.rows.length > 10) {
              html += `<p class="text-muted mt-2">Showing first 10 of ${data.rows.length} results</p>`;
            }
            resultsDiv.innerHTML = html;
          } else if (res.ok) {
            resultsDiv.innerHTML = `
              <div class="alert alert-info">
                <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                Load executed successfully but returned no data.
              </div>
            `;
          } else {
            resultsDiv.innerHTML = `
              <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
                Error: ${data.error || 'Failed to load preview.'}
              </div>
            `;
          }
        } catch (err) {
          console.error('Preview error:', err);
          const resultsDiv = detailsDiv.querySelector('.preview-results');
          resultsDiv.innerHTML = `
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
              Network error: Failed to load preview.
            </div>
          `;
        }
      } else {
        detailsDiv.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye"></i> Preview';
      }
    };
  });

  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async function() {
      const card = btn.closest('.card');
      const id = card.getAttribute('data-id');
      if (btn.dataset.confirmed !== 'true') {
        btn.innerHTML = '<i class="fas fa-check"></i> Confirm';
        btn.dataset.confirmed = 'true';
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-trash"></i> Delete';
          btn.dataset.confirmed = 'false';
        }, 3000);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (res.ok) {
          loadLoads();
          showStatus('Load profile deleted successfully.', 'success');
        } else {
          const data = await res.json();
          showStatus('Error deleting load: ' + (data.error || 'Unknown error'), 'danger', 5000);
        }
      } catch (err) {
        console.error('Delete error:', err);
        showStatus('Error deleting load profile.', 'danger', 5000);
      }
    };
  });
}

// Load all loads from API
async function loadLoads() {
  loadsList.innerHTML = 'Loading...';
  try {
    const res = await fetch(API_BASE);
    allLoads = await res.json();
    renderLoads();
  } catch (err) {
    loadsList.innerHTML = 'Error loading loads.';
    console.error('Error loading loads:', err);
  }
}

// Load transforms for the select dropdown
async function loadTransforms() {
  transformSelect.innerHTML = '<option value="">Loading...</option>';
  try {
    const res = await fetch('/api/transform');
    const transforms = await res.json();
    transformSelect.innerHTML = '<option value="">Select a transform...</option>' +
      transforms.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  } catch (err) {
    transformSelect.innerHTML = '<option value="">Error loading transforms</option>';
    console.error('Error loading transforms:', err);
  }
}

// Show add/edit form
addBtn.onclick = () => showForm('Add Load Profile');

function showForm(title, load = null) {
  formDiv.style.display = 'block';
  addBtn.style.display = 'none';
  document.getElementById('form-title').textContent = title;
  form.reset();
  
  // Prefill form if editing
  if (load) {
    form.elements['name'].value = load.name;
    form.elements['transform_id'].value = load.transform_id;
    if (form.elements['description']) {
      form.elements['description'].value = load.description || '';
    }
    form.dataset.editId = load.id;
  } else {
    form.dataset.editId = '';
  }
}

// Hide add/edit form
cancelBtn.onclick = () => {
  formDiv.style.display = 'none';
  addBtn.style.display = 'block';
};

// Submit form
form.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = {
    name: formData.get('name'),
    transform_id: formData.get('transform_id'),
    description: formData.get('description') || ''
  };
  
  const editId = form.dataset.editId;
  const url = editId ? `${API_BASE}/${editId}` : API_BASE;
  const method = editId ? 'PUT' : 'POST';
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    if (res.ok) {
      loadLoads();
      cancelBtn.click();
      showStatus(`Load profile ${editId ? 'updated' : 'created'} successfully.`, 'success');
    } else {
      showStatus('Error: ' + (result.error || 'Unknown error'), 'danger', 5000);
    }
  } catch (err) {
    showStatus('Error saving load profile.', 'danger', 5000);
    console.error('Submit error:', err);
  }
};

// Initialize
loadLoads();
loadTransforms();
