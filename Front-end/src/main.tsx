import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/accessibility.css';
import './styles/theme.css';
import { initializeAccessibility } from './utils/accessibility';

// Inicializar accesibilidad antes de renderizar
initializeAccessibility();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

