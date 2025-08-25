import React from 'react';
import ReactDOM from 'react-dom/client';
import MinimalApp from './MinimalApp';
// import SimpleApp from './SimpleApp';
// import App from './App';
import './src/overrides.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);