/* This is a normal website: no install prompt and no offline cache.
   If an older version of the site registered a service worker in this browser, remove it so visitors always get the latest files. */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
  if (window.caches) caches.keys().then(function (ks) { ks.forEach(function (k) { if (k.indexOf('chereta') === 0) caches.delete(k); }); }).catch(function () {});
}
