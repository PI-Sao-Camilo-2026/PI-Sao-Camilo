import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SessaoProvider } from './contexts/SessaoContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SessaoProvider>
        <App />
      </SessaoProvider>
    </AuthProvider>
  </React.StrictMode>
);