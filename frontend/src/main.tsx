import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configureMockApi } from '@/api/mockApi';
import { parseMockApiParams } from '@/api/mockApiParams';
import { App } from '@/app/App';
import './index.css';

// Dev-only: `?failureRate=0` (or `=1`, plus optional `lostResponseShare`) tunes the mock API.
if (import.meta.env.DEV) {
  configureMockApi(parseMockApiParams(window.location.search));
}

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
