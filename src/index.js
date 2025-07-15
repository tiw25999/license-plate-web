import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider }    from './contexts/AuthContext';
import { RefreshProvider } from './contexts/RefreshContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RefreshProvider>
        <App />
      </RefreshProvider>
    </AuthProvider>
  </React.StrictMode>
);
