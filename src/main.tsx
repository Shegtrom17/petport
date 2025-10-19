import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StaticFallback } from './components/StaticFallback'
import { isIOSDevice } from './utils/iosDetection'

// Add platform class to html element for CSS targeting
if (isIOSDevice()) {
  document.documentElement.classList.add('platform-ios');
} else {
  document.documentElement.classList.add('platform-android');
}

// Add platform detection to body for CSS targeting
const isAndroid = /android/i.test(navigator.userAgent);
if (isAndroid) {
  document.body.classList.add('platform-android');
}

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
  window.addEventListener('load', async () => {
    try {
      const RESET_KEY = 'sw-reset-petport-v14'; // Force cache clear after dependency changes
      if (!localStorage.getItem(RESET_KEY)) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
        localStorage.setItem(RESET_KEY, '1');
        console.log('SW: performed one-time unregister and cache clear');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered successfully', registration.scope);
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  });
}
