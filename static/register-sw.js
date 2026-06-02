(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', function onLoad() {
    navigator.serviceWorker.register('/sw.js').catch(function onError(err) {
      console.error('Service Worker registration failed:', err);
    });
  });
})();
