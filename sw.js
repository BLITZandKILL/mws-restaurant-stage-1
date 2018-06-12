var staticCacheName = 'restaurant-reviews-v1';
var errorCache = 'restaurant-reviews-errors-v1';
var urlsToCache = [
    '/',
    '/css/styles.css',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/js/main.js'
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(staticCacheName)
            .then(function (cache) {
                console.log('Opened cache');
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


// **
// Caches all local images on page
// Will only cache the images that are displayed
// This will make sure full sized images are not cached on a smaller device
// **
self.addEventListener('fetch', function (event) {
    while (i = 0, i < document.images.length, i++) {
        event.respondWith(
            caches.open(staticCacheName).then(function (cache) {
                return cache.match(document.images.item(i).src).then(function (response) {
                    return response || fetch(document.images.item(i).src).then(function (response) {
                        if (document.images.item(i).src.startsWith('images/')) {
                            cache.put(document.images.item(i).src, response.clone());
                            return response;
                        } else {
                            return false;
                        }
                    });
                });
            })
        );
    }
});

// **
// Delete old caches upon activation of new cache
//**
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return true;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});