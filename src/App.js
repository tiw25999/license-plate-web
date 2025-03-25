import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import './App.css';
import PlateManager from './components/PlateManager';

function App() {
  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand mb-0 h1">License Plate Detection System</span>
        </div>
      </nav>
      <PlateManager />
    </div>
  );
}

export default App;