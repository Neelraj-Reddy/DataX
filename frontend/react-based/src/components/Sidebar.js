import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-database"></i>
        </div>
        <h2 className="sidebar-title">DataX</h2>
      </div>
      
      <ul className="sidebar-nav">
        <li className="sidebar-nav-item">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-home sidebar-nav-icon"></i>
            Dashboard
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/transform" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-exchange-alt sidebar-nav-icon"></i>
            Transform
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/load" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-upload sidebar-nav-icon"></i>
            Load Data
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/lineage" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-project-diagram sidebar-nav-icon"></i>
            Lineage
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/editor" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-code sidebar-nav-icon"></i>
            SQL Editor
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;