// FIX: Corrected the import order. The React module must be imported before any files that might augment its types, such as './types.ts'. The previous order was causing a race condition during module initialization, preventing React's JSX types from being correctly recognized and causing the application to fail during render.
import * as React from 'react';
import './types';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
