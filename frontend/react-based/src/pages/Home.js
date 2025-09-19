import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout 
      title="DataX Platform" 
      subtitle="Revolutionary data transformation and analytics platform"
    >
      {/* Hero Section */}
      <div className="card">
        <div className="card-body">
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <h2 style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-bold)', 
              color: 'var(--text-high)', 
              marginBottom: 'var(--space-4)' 
            }}>
              Transform Your Data Journey
            </h2>
            <p style={{ 
              fontSize: 'var(--text-lg)', 
              color: 'var(--text-low)', 
              marginBottom: 'var(--space-8)', 
              maxWidth: '600px', 
              marginLeft: 'auto', 
              marginRight: 'auto' 
            }}>
              Experience next-generation data processing with our cutting-edge platform. 
              Load, transform, and visualize your data with unprecedented ease and sophistication.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-4)', 
              justifyContent: 'center', 
              flexWrap: 'wrap' 
            }}>
              <Link to="/load" className="btn btn-primary btn-lg">
                <i className="fas fa-upload" style={{ marginRight: 'var(--space-2)' }}></i>
                Load Data
              </Link>
              <Link to="/transform" className="btn btn-secondary btn-lg">
                <i className="fas fa-cogs" style={{ marginRight: 'var(--space-2)' }}></i>
                Transform
              </Link>
              <Link to="/lineage" className="btn btn-accent btn-lg">
                <i className="fas fa-project-diagram" style={{ marginRight: 'var(--space-2)' }}></i>
                Visualize
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: 'var(--space-6)', 
        marginBottom: 'var(--space-8)' 
      }}>
        {/* Data Loading Feature */}
        <div className="card hover-lift">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-database" style={{ color: 'var(--primary-400)', marginRight: 'var(--space-3)' }}></i>
              Smart Data Loading
            </h3>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-4)' }}>
              Seamlessly import data from multiple sources with intelligent parsing and validation. 
              Support for CSV, JSON, Excel, and database connections.
            </p>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="badge badge-primary" style={{ marginRight: 'var(--space-2)' }}>CSV</div>
              <div className="badge badge-primary" style={{ marginRight: 'var(--space-2)' }}>JSON</div>
              <div className="badge badge-primary" style={{ marginRight: 'var(--space-2)' }}>Excel</div>
              <div className="badge badge-primary">Database</div>
            </div>
            <Link to="/load" className="btn btn-primary">
              <i className="fas fa-arrow-right" style={{ marginRight: 'var(--space-2)' }}></i>
              Start Loading
            </Link>
          </div>
        </div>

        {/* Data Transformation Feature */}
        <div className="card hover-lift">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-magic" style={{ color: 'var(--secondary-400)', marginRight: 'var(--space-3)' }}></i>
              Advanced Transformations
            </h3>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-4)' }}>
              Apply powerful transformations with our visual editor. Filter, aggregate, join, 
              and manipulate data with enterprise-grade operations.
            </p>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="badge badge-secondary" style={{ marginRight: 'var(--space-2)' }}>Filter</div>
              <div className="badge badge-secondary" style={{ marginRight: 'var(--space-2)' }}>Join</div>
              <div className="badge badge-secondary" style={{ marginRight: 'var(--space-2)' }}>Aggregate</div>
              <div className="badge badge-secondary">Clean</div>
            </div>
            <Link to="/transform" className="btn btn-secondary">
              <i className="fas fa-arrow-right" style={{ marginRight: 'var(--space-2)' }}></i>
              Start Transforming
            </Link>
          </div>
        </div>

        {/* Data Visualization Feature */}
        <div className="card hover-lift">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-line" style={{ color: 'var(--accent-400)', marginRight: 'var(--space-3)' }}></i>
              Interactive Lineage
            </h3>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-4)' }}>
              Visualize data flow and relationships with interactive network diagrams. 
              Track data lineage and understand transformation impacts.
            </p>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="badge badge-accent" style={{ marginRight: 'var(--space-2)' }}>Network</div>
              <div className="badge badge-accent" style={{ marginRight: 'var(--space-2)' }}>Flow</div>
              <div className="badge badge-accent" style={{ marginRight: 'var(--space-2)' }}>Lineage</div>
              <div className="badge badge-accent">Impact</div>
            </div>
            <Link to="/lineage" className="btn btn-accent">
              <i className="fas fa-arrow-right" style={{ marginRight: 'var(--space-2)' }}></i>
              Explore Lineage
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Platform Statistics</h3>
        </div>
        <div className="card-body">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'var(--space-6)', 
            textAlign: 'center' 
          }}>
            <div>
              <div style={{ 
                fontSize: 'var(--text-4xl)', 
                fontWeight: 'var(--font-bold)', 
                color: 'var(--primary-400)', 
                marginBottom: 'var(--space-2)' 
              }}>
                1.2M+
              </div>
              <div style={{ color: 'var(--text-low)', fontWeight: 'var(--font-medium)' }}>
                Records Processed
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: 'var(--text-4xl)', 
                fontWeight: 'var(--font-bold)', 
                color: 'var(--secondary-400)', 
                marginBottom: 'var(--space-2)' 
              }}>
                500+
              </div>
              <div style={{ color: 'var(--text-low)', fontWeight: 'var(--font-medium)' }}>
                Transformations
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: 'var(--text-4xl)', 
                fontWeight: 'var(--font-bold)', 
                color: 'var(--accent-400)', 
                marginBottom: 'var(--space-2)' 
              }}>
                99.9%
              </div>
              <div style={{ color: 'var(--text-low)', fontWeight: 'var(--font-medium)' }}>
                Uptime
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: 'var(--text-4xl)', 
                fontWeight: 'var(--font-bold)', 
                color: 'var(--warning-400)', 
                marginBottom: 'var(--space-2)' 
              }}>
                24/7
              </div>
              <div style={{ color: 'var(--text-low)', fontWeight: 'var(--font-medium)' }}>
                Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;