import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Transform from './pages/Transform';
import Load from './pages/Load';
import Editor from './pages/Editor';
import Lineage from './pages/Lineage';
import './styles/ultra-modern.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route redirects to home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Main application routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/transform" element={<Transform />} />
          <Route path="/load" element={<Load />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/lineage" element={<Lineage />} />
          
          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;