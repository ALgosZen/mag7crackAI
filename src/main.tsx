/**
 * Front-end Entrypoint
 * Mounts the main React application component within React.StrictMode into the root HTML element.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.
