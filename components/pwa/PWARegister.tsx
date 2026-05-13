'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    } else if ('serviceWorker' in navigator && window.location.hostname === 'localhost') {
        // Register on localhost for development testing if needed, but usually sw.js is served better in prod
        // navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return null;
}
