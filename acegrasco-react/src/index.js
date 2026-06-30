/**
 * index.js
 * Punto de entrada de la aplicación React.
 * Portal de Autogestión - Acegrasco S.A.
 * Evidencia: GA7-220501096-AA3-EV01
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
