import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './router';
import { AccessibilityProvider } from './providers/AccessibilityProvider';

function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App;

