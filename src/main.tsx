import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { testProductionAuth, testProductionEndpoints } from './lib/api-debug.ts'

// Make test functions available in browser console for debugging
if (import.meta.env.DEV) {
  (window as any).testProductionAuth = testProductionAuth;
  (window as any).testProductionEndpoints = testProductionEndpoints;
  console.log('🔧 Debug functions available:');
  console.log('  - testProductionAuth() - Test authentication');
  console.log('  - testProductionEndpoints() - Test API endpoints');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
