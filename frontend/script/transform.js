// Helper: API base URL (consistent with backend)
const API_BASE = '/api/transform';

// Elements
const transformsList = document.getElementById('transforms-list');
const addBtn = document.getElementById('add-transform-btn');
const formDiv = document.getElementById('add-transform-form');
const form = document.getElementById('transform-form');
const cancelBtn = document.getElementById('cancel-btn');
const depCheckboxes = document.getElementById('dependencies-checkboxes');
const searchBar = document.getElementById('searchTransforms');

// Status message
let statusDiv = document.getElementById('status-message');
if (!statusDiv) {
  statusDiv = document.createElement('div');
  statusDiv.id = 'status-message';
  statusDiv.className = 'mb-4';
  document.querySelector('.main-content').appendChild(statusDiv);
}

function showStatus(msg, type = 'info', timeout = 3000) {
  statusDiv.innerHTML = `<div class="alert alert-${type} mb-3">${msg}</div>`;
  if (timeout) setTimeout(() => { statusDiv.innerHTML = ''; }, timeout);
}

// Global transforms array
let allTransforms = [];

// Search functionality
searchBar.addEventListener('input', () => {
  renderTransforms();
});

function renderTransforms() {
  const search = searchBar.value.trim().toLowerCase();
  const filtered = allTransforms.filter(t => 
    t.name.toLowerCase().includes(search) || 
    t.query.toLowerCase().includes(search) ||
    (t.dependencies && t.dependencies.toLowerCase().includes(search))
  );
  
  if (!filtered.length) {
    transformsList.innerHTML = `
      <div class="card text-center">
        <div class="card-body">
          <i class="fas fa-search text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h4 class="text-muted">No transforms found</h4>
          <p class="text-muted">Try adjusting your search terms or create a new transform.</p>
        </div>
      </div>
    `;
    return;
  }
  
  transformsList.innerHTML = filtered.map(t => `
    <div class="card fade-in" data-id="${t.id}" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="card-title mb-0">
            <i class="fas fa-exchange-alt text-accent" style="margin-right: 0.5rem;"></i>
            ${t.name}
          </h4>
          <div class="btn-group">
            <button class="btn btn-sm btn-secondary preview-btn">
              <i class="fas fa-eye"></i> Preview
            </button>
            <button class="btn btn-sm btn-secondary edit-btn">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger delete-btn">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="transform-summary">
          <p class="text-secondary mb-2">
            <strong>Dependencies:</strong> ${t.dependencies || 'None'}
          </p>
          <div class="bg-secondary p-3 rounded">
            <code style="color: var(--text-primary); font-size: 0.875rem;">${t.query.substring(0, 100)}${t.query.length > 100 ? '...' : ''}</code>
          </div>
        </div>
        <div class="transform-details" style="display:none;"></div>
      </div>
    </div>
  `).join('');

  // Add event listeners for action buttons
  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.onclick = async function() {
      const card = btn.closest('.card');
      const id = card.getAttribute('data-id');
      const t = allTransforms.find(x => x.id == id);
      const detailsDiv = card.querySelector('.transform-details');
      
      if (detailsDiv.style.display === 'none') {
        detailsDiv.innerHTML = `
          <div class="mt-4">
            <h5 class="text-primary mb-3">
              <i class="fas fa-code" style="margin-right: 0.5rem;"></i>
              Full SQL Query
            </h5>
            <div class="bg-secondary p-3 rounded mb-4">
              <pre style="color: var(--text-primary); margin: 0; white-space: pre-wrap;">${t.query}</pre>
            </div>
            <div class="preview-results">
              <div class="d-flex align-items-center mb-3">
                <div class="loading" style="margin-right: 0.75rem;"></div>
                <span>Loading preview results...</span>
              </div>
            </div>
          </div>
        `;
        detailsDiv.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
        
        // Run query and show results
        try {
          const res = await fetch(`${API_BASE}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: t.query })
          });
          const data = await res.json();
          const resultsDiv = detailsDiv.querySelector('.preview-results');
          
          if (res.ok && data.rows && data.rows.length) {
            // Build table
            const cols = Object.keys(data.rows[0]);
            let html = `
              <h5 class="text-primary mb-3">
                <i class="fas fa-table" style="margin-right: 0.5rem;"></i>
                Preview Results (${data.rows.length} rows)
              </h5>
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
                Query executed successfully but returned no results.
              </div>
            `;
          } else {
            resultsDiv.innerHTML = `
              <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
                Error: ${data.error || 'Failed to run query.'}
              </div>
            `;
          }
        } catch (err) {
          console.error('Preview error:', err);
          const resultsDiv = detailsDiv.querySelector('.preview-results');
          resultsDiv.innerHTML = `
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
              Network error: Failed to execute query.
            </div>
          `;
        }
      } else {
        detailsDiv.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye"></i> Preview';
      }
    };
  });

  // Add event listeners for edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async function() {
      const card = btn.closest('.card');
      const id = card.getAttribute('data-id');
      const t = filtered.find(x => x.id == id);
      showForm('Edit Transform', t);
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
          loadTransforms();
          showStatus('Transform deleted successfully.', 'success');
        } else {
          const data = await res.json();
          showStatus('Error deleting transform: ' + (data.error || 'Unknown error'), 'danger', 5000);
        }
      } catch (err) {
        console.error('Delete error:', err);
        showStatus('Error deleting transform.', 'danger', 5000);
      }
    };
  });
}

// Update loadTransforms to use allTransforms and renderTransforms
async function loadTransforms() {
  transformsList.innerHTML = 'Loading...';
  try {
    const res = await fetch(API_BASE);
    allTransforms = await res.json();
    renderTransforms();
  } catch (err) {
    transformsList.innerHTML = 'Error loading transforms.';
  }
}


// Show add/edit form
addBtn.onclick = () => showForm('Add New Transform');

async function showForm(title, transform = null) {
  formDiv.style.display = 'block';
  addBtn.style.display = 'none';
  document.getElementById('form-title').textContent = title;
  form.reset();
  // Load table names for dependencies
  depCheckboxes.innerHTML = 'Loading tables...';
  try {
    const res = await fetch(API_BASE + '/tables');
    const tables = await res.json();
    // Add search bar for dependencies
    depCheckboxes.innerHTML = '<input type="text" class="form-control mb-2" id="dep-search" placeholder="Search tables...">';
    depCheckboxes.innerHTML += tables.map(table => {
      const checked = transform && transform.dependencies && transform.dependencies.split(',').includes(table) ? 'checked' : '';
      return `
        <div class="form-check dep-item">
          <input class="form-check-input" type="checkbox" name="dependencies" value="${table}" id="dep-${table}" ${checked}>
          <label class="form-check-label" for="dep-${table}">${table}</label>
        </div>
      `;
    }).join('');
    // Dependency search filter
    const depSearch = document.getElementById('dep-search');
    depSearch.addEventListener('input', () => {
      const val = depSearch.value.trim().toLowerCase();
      document.querySelectorAll('.dep-item').forEach(div => {
        const label = div.querySelector('label').textContent.toLowerCase();
        div.style.display = label.includes(val) ? '' : 'none';
      });
    });
  } catch {
    depCheckboxes.innerHTML = 'Error loading tables.';
  }
  // Prefill form if editing
  if (transform) {
    form.elements['name'].value = transform.name;
    form.elements['query'].value = transform.query;
    form.dataset.editId = transform.id;
  } else {
    form.dataset.editId = '';
  }
}


// Hide add/edit form
cancelBtn.onclick = () => {
	formDiv.style.display = 'none';
	addBtn.style.display = 'inline-block';
	form.reset();
	form.dataset.editId = '';
};


// Submit add/edit transform (validate query first)
form.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const name = formData.get('name');
  const query = formData.get('query');
  const dependencies = Array.from(form.querySelectorAll('input[name="dependencies"]:checked')).map(cb => cb.value);
  const editId = form.dataset.editId;

  // Validate query first
  showStatus('Validating query...', 'info', 0);
  try {
    const validateRes = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const validateData = await validateRes.json();
    if (!validateRes.ok) {
      showStatus('Query Error: ' + (validateData.error || 'Invalid query'), 'danger', 5000);
      return;
    }
  } catch {
    showStatus('Query validation failed.', 'danger', 5000);
    return;
  }

  // Save or update transform
  try {
    let res;
    if (editId) {
      res = await fetch(`${API_BASE}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, query, dependencies })
      });
    } else {
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, query, dependencies })
      });
    }
    if (res.ok) {
      formDiv.style.display = 'none';
      addBtn.style.display = 'inline-block';
      form.reset();
      form.dataset.editId = '';
      loadTransforms();
      showStatus(editId ? 'Transform updated successfully.' : 'Transform added successfully.', 'success');
    } else {
      const data = await res.json();
      showStatus('Error saving transform: ' + (data.error || 'Unknown error'), 'danger', 5000);
    }
  } catch {
    showStatus('Error saving transform.', 'danger', 5000);
  }
};

// Scroll to and highlight transform card if hash is present
function highlightTransformFromHash() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#transform-')) {
    const id = hash.replace('#transform-', '');
    const card = document.querySelector(`.card[data-id='${id}']`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('bg-warning');
      setTimeout(() => card.classList.remove('bg-warning'), 2000);
    }
  }
}
window.addEventListener('DOMContentLoaded', highlightTransformFromHash);
window.addEventListener('hashchange', highlightTransformFromHash);

// Initial load
loadTransforms();

