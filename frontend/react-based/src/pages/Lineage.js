import React, { useState, useEffect, useRef } from 'react';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';
import Layout from '../components/Layout';

const Lineage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [lineageData, setLineageData] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [networkOptions, setNetworkOptions] = useState({
    nodes: {
      shape: 'box',
      margin: 10,
      font: { size: 14, color: '#e4e6ea' },
      color: {
        background: '#2a2d3a',
        border: '#3b82f6',
        highlight: { background: '#3b82f6', border: '#1d4ed8' }
      }
    },
    edges: {
      color: { color: '#6b7280' },
      arrows: { to: { enabled: true, scaleFactor: 1.2 } },
      smooth: { enabled: true, type: 'continuous' }
    },
    layout: { hierarchical: { enabled: false } },
    physics: { enabled: true, stabilization: { iterations: 100 } }
  });
  const [status, setStatus] = useState({ message: '', type: '', show: false });
  
  const networkContainer = useRef(null);
  const network = useRef(null);

  const API_BASE = '/api/lineage';

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (lineageData.nodes.length > 0) {
      renderNetwork();
    }
  }, [lineageData]);

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

  const loadLineage = async () => {
    if (!selectedTable) {
      showStatus('Please select a table to trace lineage', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${selectedTable}`);
      const data = await response.json();
      
      if (response.ok) {
        setLineageData(data);
        showStatus('Lineage loaded successfully', 'success');
      } else {
        throw new Error(data.error || 'Failed to load lineage');
      }
    } catch (error) {
      showStatus(`Lineage error: ${error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNetwork = () => {
    if (!networkContainer.current) return;

    // Clean up existing network
    if (network.current) {
      network.current.destroy();
    }

    // Create new datasets
    const nodes = new DataSet(lineageData.nodes);
    const edges = new DataSet(lineageData.edges);

    // Create network
    const data = { nodes, edges };
    network.current = new Network(networkContainer.current, data, networkOptions);

    // Add event listeners
    network.current.on('click', function (params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.get(nodeId);
        showNodeDetails(node);
      }
    });

    network.current.on('hoverNode', function (params) {
      networkContainer.current.style.cursor = 'pointer';
    });

    network.current.on('blurNode', function (params) {
      networkContainer.current.style.cursor = 'default';
    });
  };

  const showNodeDetails = (node) => {
    showStatus(`Table: ${node.label} | Type: ${node.type || 'Table'} | Connections: ${node.connections || 0}`, 'info', 5000);
  };

  const generateSampleLineage = () => {
    const sampleData = {
      nodes: [
        { id: 1, label: 'source_data', type: 'Source', connections: 1, color: { background: '#059669', border: '#047857' } },
        { id: 2, label: 'raw_customers', type: 'Raw', connections: 2, color: { background: '#dc2626', border: '#b91c1c' } },
        { id: 3, label: 'clean_customers', type: 'Transformed', connections: 2, color: { background: '#d97706', border: '#b45309' } },
        { id: 4, label: 'customer_analytics', type: 'Analytics', connections: 1, color: { background: '#7c3aed', border: '#6d28d9' } },
        { id: 5, label: 'customer_reports', type: 'Output', connections: 0, color: { background: '#1f2937', border: '#374151' } }
      ],
      edges: [
        { from: 1, to: 2, label: 'extract' },
        { from: 2, to: 3, label: 'clean & validate' },
        { from: 3, to: 4, label: 'aggregate' },
        { from: 4, to: 5, label: 'generate reports' }
      ]
    };
    
    setLineageData(sampleData);
    showStatus('Sample lineage generated', 'success');
  };

  const clearLineage = () => {
    setLineageData({ nodes: [], edges: [] });
    setSelectedTable('');
    if (network.current) {
      network.current.destroy();
      network.current = null;
    }
  };

  const exportLineage = () => {
    if (lineageData.nodes.length === 0) {
      showStatus('No lineage data to export', 'warning');
      return;
    }

    const exportData = {
      table: selectedTable,
      timestamp: new Date().toISOString(),
      lineage: lineageData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lineage_${selectedTable || 'data'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('Lineage exported successfully', 'success');
  };

  return (
    <Layout title="Data Lineage" subtitle="Visualize data flow and dependencies">
      {/* Controls Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-project-diagram text-primary" style={{ marginRight: '0.5rem' }}></i>
            Lineage Visualization Controls
          </h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <div className="form-group">
                <label className="form-label" htmlFor="tableSelect">Select Table</label>
                <select
                  id="tableSelect"
                  className="form-control"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  <option value="">Choose a table to trace lineage...</option>
                  {tables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button 
                    className="btn btn-primary flex-1"
                    onClick={loadLineage}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search" style={{ marginRight: '0.5rem' }}></i>
                        Trace Lineage
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-group">
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary"
                onClick={generateSampleLineage}
              >
                <i className="fas fa-eye" style={{ marginRight: '0.5rem' }}></i>
                View Sample
              </button>
              <button 
                className="btn btn-accent"
                onClick={exportLineage}
                disabled={lineageData.nodes.length === 0}
              >
                <i className="fas fa-download" style={{ marginRight: '0.5rem' }}></i>
                Export JSON
              </button>
              <button 
                className="btn btn-ghost"
                onClick={clearLineage}
              >
                <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                Clear
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

      {/* Network Visualization */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">
            <i className="fas fa-sitemap text-accent" style={{ marginRight: '0.5rem' }}></i>
            Data Flow Visualization
            {lineageData.nodes.length > 0 && (
              <span className="badge badge-primary ml-2">
                {lineageData.nodes.length} nodes, {lineageData.edges.length} connections
              </span>
            )}
          </h4>
        </div>
        <div className="card-body">
          {lineageData.nodes.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '4rem' }}>
              <i className="fas fa-project-diagram" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <h5>No Lineage Data</h5>
              <p>Select a table and click "Trace Lineage" to visualize data flow, or view a sample lineage.</p>
            </div>
          ) : (
            <div 
              ref={networkContainer}
              style={{ 
                height: '500px', 
                width: '100%',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                background: 'var(--bg-secondary)'
              }}
            />
          )}
        </div>
      </div>

      {/* Legend */}
      {lineageData.nodes.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-info-circle text-secondary" style={{ marginRight: '0.5rem' }}></i>
              Visualization Legend
            </h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Node Types</h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#059669', 
                      border: '2px solid #047857',
                      borderRadius: '4px'
                    }}></div>
                    <span>Source Tables</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#dc2626', 
                      border: '2px solid #b91c1c',
                      borderRadius: '4px'
                    }}></div>
                    <span>Raw Data</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#d97706', 
                      border: '2px solid #b45309',
                      borderRadius: '4px'
                    }}></div>
                    <span>Transformed Data</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <h6>Interactions</h6>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>Click on nodes to see details</li>
                  <li>Drag nodes to reorganize layout</li>
                  <li>Scroll to zoom in/out</li>
                  <li>Arrows indicate data flow direction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Lineage;