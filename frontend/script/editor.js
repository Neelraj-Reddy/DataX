// Helper: API base URL
const API_BASE = '/api/editor';

const sqlInput = document.getElementById('sql-input');
const checkDepBtn = document.getElementById('check-dep-btn');
const runQueryBtn = document.getElementById('run-query-btn');
const depResult = document.getElementById('dep-result');
const queryResult = document.getElementById('query-result');
const tableSearch = document.getElementById('table-search');
let statusDiv = document.getElementById('status-message');

function showStatus(msg, type = 'info', timeout = 3000) {
  statusDiv.innerHTML = `<div class="alert alert-${type} text-center mb-2 py-2">${msg}</div>`;
  if (timeout) setTimeout(() => { statusDiv.innerHTML = ''; }, timeout);
}

async function updateDependencies(sql) {
  depResult.innerHTML = '';
  
  
  showStatus('Checking dependencies...', 'info', 0);
  try {
    const res = await fetch(API_BASE + '/dependencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });
    const data = await res.json();
    if (res.ok) {
      let depHtml = '';
      if (data.tables.length) {
        depHtml = `<strong>Tables used:</strong> <ul>${data.tables.map(t => `<li>${t}</li>`).join('')}</ul>`;
      } else {
        depHtml = '<strong>No standard tables found in SQL.</strong>';
      }
      depResult.innerHTML = depHtml;
      
      
      showStatus('Dependencies checked.', 'success');
    } else {
      depResult.innerHTML = `<span class="text-danger">Error: ${data.error || 'Failed to check dependencies.'}</span>`;
      showStatus('Error checking dependencies.', 'danger', 5000);
    }
  } catch {
    depResult.innerHTML = '<span class="text-danger">Error checking dependencies.</span>';
    
    showStatus('Error checking dependencies.', 'danger', 5000);
  }
}

checkDepBtn.onclick = async () => {
  await updateDependencies(sqlInput.value);
};

// Initial dependency check on page load
updateDependencies(sqlInput.value);

runQueryBtn.onclick = async () => {
  queryResult.innerHTML = '';
  showStatus('Running query...', 'info', 0);
  try {
    const sql = sqlInput.value;
    const res = await fetch(API_BASE + '/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });
    const data = await res.json();
    if (res.ok) {
      if (data.rows && data.rows.length) {
        const cols = data.fields.map(f => f.name);
        let html = '<table class="table table-bordered table-sm"><thead><tr>';
        html += cols.map(c => `<th>${c}</th>`).join('');
        html += '</tr></thead><tbody>';
        html += data.rows.map(row => '<tr>' + cols.map(c => `<td>${row[c]}</td>`).join('') + '</tr>').join('');
        html += '</tbody></table>';
        queryResult.innerHTML = `<strong>Query Results:</strong><br>${html}`;
      } else {
        queryResult.innerHTML = '<strong>No results.</strong>';
      }
      showStatus('Query executed.', 'success');
    } else {
      queryResult.innerHTML = `<span class="text-danger">Error: ${data.error || 'Failed to run query.'}</span>`;
      showStatus('Error running query.', 'danger', 5000);
    }
  } catch {
    queryResult.innerHTML = '<span class="text-danger">Error running query.</span>';
    showStatus('Error running query.', 'danger', 5000);
  }
};

// Show all table names with toggle button for schema and search feature
let allTables = [];
async function showTablesAndSchemas() {
  const tablesDiv = document.getElementById('tables-schemas');
  tablesDiv.innerHTML = '<strong>Loading tables...</strong>';
  try {
    const res = await fetch(API_BASE + '/tables');
    const tables = await res.json();
    if (res.ok) {
      allTables = tables;
      renderTables(tables);
    } else {
      tablesDiv.innerHTML = '<span class="text-danger">Error loading tables.</span>';
    }
  } catch {
    tablesDiv.innerHTML = '<span class="text-danger">Error loading tables.</span>';
  }
}

function renderTables(tables) {
  const tablesDiv = document.getElementById('tables-schemas');
  let html = `<strong>Tables:</strong><br>
    <table class="table table-bordered table-hover table-sm align-middle mb-0"><thead>
      <tr><th>Table Name</th><th>Schema</th></tr>
    </thead><tbody>`;
  html += tables.map((t, i) => `
    <tr>
      <td><span class="fw-semibold">${t.name}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-info show-schema-btn" data-idx="${i}">Show Schema</button>
        <div class="table-schema mt-2" style="display:none;"></div>
      </td>
    </tr>
  `).join('');
  html += '</tbody></table>';
  tablesDiv.innerHTML = html;
  tables.forEach((t, i) => {
    const btn = tablesDiv.querySelector(`.show-schema-btn[data-idx='${i}']`);
    const schemaDiv = btn.nextElementSibling;
    btn.onclick = () => {
      if (schemaDiv.style.display === 'none') {
        schemaDiv.innerHTML = `<table class="table table-bordered table-sm mb-0"><thead><tr><th>Field</th><th>Type</th></tr></thead><tbody>
          ${t.columns.map(col => `<tr><td>${col.Field}</td><td>${col.Type}</td></tr>`).join('')}
        </tbody></table>`;
        schemaDiv.style.display = 'block';
        btn.textContent = 'Hide Schema';
      } else {
        schemaDiv.style.display = 'none';
        btn.textContent = 'Show Schema';
      }
    };
  });
}

tableSearch.addEventListener('input', function() {
  const val = tableSearch.value.trim().toLowerCase();
  if (!val) {
    // Show only first 10 tables if no search
    renderTables(allTables.slice(0, 10));
  } else {
    // Show all matching tables when searched
    const filtered = allTables.filter(t => t.name.toLowerCase().includes(val));
    renderTables(filtered);
  }
});

// On initial load, show only first 10 tables
function renderInitialTables() {
  renderTables(allTables.slice(0, 10));
}

async function showTablesAndSchemas() {
  const tablesDiv = document.getElementById('tables-schemas');
  tablesDiv.innerHTML = '<strong>Loading tables...</strong>';
  try {
    const res = await fetch(API_BASE + '/tables');
    const tables = await res.json();
    if (res.ok) {
      allTables = tables;
      renderInitialTables();
    } else {
      tablesDiv.innerHTML = '<span class="text-danger">Error loading tables.</span>';
    }
  } catch {
    tablesDiv.innerHTML = '<span class="text-danger">Error loading tables.</span>';
  }
}

showTablesAndSchemas();
