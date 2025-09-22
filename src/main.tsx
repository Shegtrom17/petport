import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StaticFallback } from './components/StaticFallback'

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  if (event.error && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    console.error('iOS Error Context:', {
      error: event.error.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      userAgent: navigator.userAgent
    });
  }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    console.error('iOS Promise Rejection Context:', {
      reason: event.reason,
      userAgent: navigator.userAgent
    });
  }
});

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback rendering for critical failures
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div id="static-fallback"></div>
    `;
    const fallbackRoot = createRoot(document.getElementById("static-fallback")!);
    fallbackRoot.render(<StaticFallback error={error as Error} context="App Initialization" />);
  }
}

// Register Service Worker for PWA installability - gated registration
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered successfully');
      })
      .catch((err) => console.error('SW registration failed:', err));
  });
}
