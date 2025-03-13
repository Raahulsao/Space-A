import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error boundary for better debugging
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render application:', error);
    rootElement.innerHTML = `
      <div style="color: red; margin: 20px;">
        <h2>Something went wrong</h2>
        <p>Check the console for more details.</p>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
}
