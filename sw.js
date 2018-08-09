var staticCacheName = 'restaurant-reviews-v1';
var urlsToCache = [
    '/',
    '/css/style.css',
    '/js/index.js'
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(staticCacheName)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(staticCacheName).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function (response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function () {
                    return true;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});