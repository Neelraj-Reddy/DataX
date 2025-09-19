import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">{title}</h1>
              <p className="page-subtitle">{subtitle}</p>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;