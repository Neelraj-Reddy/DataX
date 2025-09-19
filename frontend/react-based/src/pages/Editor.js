import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Editor = () => {
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [tables, setTables] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '', show: false });

  const API_BASE = '/api/editor';

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const response = await fetch('/api/transform/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      showStatus('Error loading tables', 'danger');
    }
  };

  const showStatus = (message, type = 'info', timeout = 3000) => {
    setStatus({ message, type, show: true });
    if (timeout) {
      setTimeout(() => setStatus({ ...status, show: false }), timeout);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      showStatus('Please enter a SQL query', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery })
      });

      const data = await response.json();
      
      if (response.ok) {
        setQueryResults(data);
        showStatus('Query executed successfully', 'success');
      } else {
        throw new Error(data.error || 'Query execution failed');
      }
    } catch (error) {
      showStatus(`Query error: ${error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDependencies = async () => {
    if (!sqlQuery.trim()) {
      showStatus('Please enter a SQL query to analyze', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery })
      });

      const data = await response.json();
      
      if (response.ok) {
        setDependencies(data.tables || []);
        showStatus('Dependencies analyzed successfully', 'success');
      } else {
        throw new Error(data.error || 'Dependency analysis failed');
      }
    } catch (error) {
      showStatus(`Analysis error: ${error.message}`, 'danger');
    }
  };

  const handleClearQuery = () => {
    setSqlQuery('');
    setQueryResults(null);
    setDependencies([]);
  };

  const insertSampleQuery = (queryType) => {
    const sampleQueries = {
      select: 'SELECT * FROM table_name LIMIT 10;',
      join: 'SELECT a.*, b.column_name \nFROM table_a a \nJOIN table_b b ON a.id = b.table_a_id \nLIMIT 10;',
      aggregate: 'SELECT column_name, COUNT(*) as count, AVG(numeric_column) as average \nFROM table_name \nGROUP BY column_name \nORDER BY count DESC \nLIMIT 10;',
      filter: 'SELECT * FROM table_name \nWHERE column_name > value \nAND another_column = \'condition\' \nORDER BY column_name \nLIMIT 10;'
    };
    setSqlQuery(sampleQueries[queryType]);
  };

  const renderTable = (data) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return (
        <div className="text-center text-muted">
          <i className="fas fa-table" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <p>No data to display</p>
        </div>
      );
    }

    const columns = Object.keys(data.rows[0]);
    
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column}>{row[column] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout title="SQL Editor" subtitle="Execute SQL queries and analyze your data">
      {/* Query Input Section */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="card-title">
              <i className="fas fa-code text-primary" style={{ marginRight: '0.5rem' }}></i>
              SQL Query Editor
            </h3>
            <div className="btn-group">
              <button 
                className="btn btn-primary"
                onClick={handleExecuteQuery}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                    Executing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play" style={{ marginRight: '0.5rem' }}></i>
                    Execute Query
                  </>
                )}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleAnalyzeDependencies}
              >
                <i className="fas fa-search" style={{ marginRight: '0.5rem' }}></i>
                Analyze Dependencies
              </button>
              <button 
                className="btn btn-ghost"
                onClick={handleClearQuery}
              >
                <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                Clear
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label" htmlFor="sqlEditor">SQL Query</label>
            <textarea
              id="sqlEditor"
              className="form-control"
              rows="10"
              placeholder="Enter your SQL query here..."
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace', fontSize: '0.875rem' }}
            />
          </div>
          
          {/* Sample Query Buttons */}
          <div className="form-group">
            <label className="form-label">Sample Queries</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => insertSampleQuery('select')}
              >
                Basic SELECT
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => insertSampleQuery('join')}
              >
                JOIN Query
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => insertSampleQuery('aggregate')}
              >
                Aggregate
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => insertSampleQuery('filter')}
              >
                Filter & Sort
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.show && (
        <div className={`alert alert-${status.type} mb-4`}>
          {status.message}
        </div>
      )}

      {/* Available Tables */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <i className="fas fa-database text-accent" style={{ marginRight: '0.5rem' }}></i>
                Available Tables
              </h4>
            </div>
            <div className="card-body">
              {tables.length === 0 ? (
                <p className="text-muted">No tables found in database</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {tables.map(table => (
                    <div 
                      key={table} 
                      className="badge badge-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSqlQuery(prev => prev + ` ${table}`)}
                      title="Click to add to query"
                    >
                      {table}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <i className="fas fa-project-diagram text-secondary" style={{ marginRight: '0.5rem' }}></i>
                Query Dependencies
              </h4>
            </div>
            <div className="card-body">
              {dependencies.length === 0 ? (
                <p className="text-muted">No dependencies analyzed yet</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {dependencies.map(dep => (
                    <div key={dep} className="badge badge-secondary">
                      {dep}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Query Results */}
      {queryResults && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-table text-accent" style={{ marginRight: '0.5rem' }}></i>
              Query Results
              {queryResults.rows && (
                <span className="badge badge-primary ml-2">
                  {queryResults.rows.length} rows
                </span>
              )}
            </h4>
          </div>
          <div className="card-body">
            {renderTable(queryResults)}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Editor;