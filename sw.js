var CACHE_NAME = 'mws-restaurant-stage1-cache-v2';
var urlsToCache = [
  '/',
  "/index.html",
  '/restaurant.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/dbhelper.js',
  '/js/restaurant_info.js',
  'data/restaurants.json',
  '/img/1_large.jpg',
  '/img/1_medium.jpg',
  '/img/2_large.jpg',
  '/img/2_medium.jpg',
  '/img/3_large.jpg',
  '/img/3_medium.jpg',
  '/img/4_large.jpg',
  '/img/4_medium.jpg',
  '/img/5_large.jpg',
  '/img/5_medium.jpg',
  '/img/6_large.jpg',
  '/img/6_medium.jpg',
  '/img/7_large.jpg',
  '/img/7_medium.jpg',
  '/img/8_large.jpg',
  '/img/8_medium.jpg',
  '/img/9_large.jpg',
  '/img/9_medium.jpg',
  '/img/10_large.jpg',
  '/img/10_medium.jpg',
  '/img/restaurantLong/1_large.jpg',
  '/img/restaurantLong/1_medium.jpg',
  '/img/restaurantLong/2_large.jpg',
  '/img/restaurantLong/2_medium.jpg',
  '/img/restaurantLong/3_large.jpg',
  '/img/restaurantLong/3_medium.jpg',
  '/img/restaurantLong/4_large.jpg',
  '/img/restaurantLong/4_medium.jpg',
  '/img/restaurantLong/5_large.jpg',
  '/img/restaurantLong/5_medium.jpg',
  '/img/restaurantLong/6_large.jpg',
  '/img/restaurantLong/6_medium.jpg',
  '/img/restaurantLong/7_large.jpg',
  '/img/restaurantLong/7_medium.jpg',
  '/img/restaurantLong/8_large.jpg',
  '/img/restaurantLong/8_medium.jpg',
  '/img/restaurantLong/9_large.jpg',
  '/img/restaurantLong/9_medium.jpg',
  '/img/restaurantLong/10_large.jpg',
  '/img/restaurantLong/10_medium.jpg',
];

// INSTALL SERVICE WORKER

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// CACHE and RETURN REQUESTS

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
  });


  // Update a service worker

  self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('mws-') &&
                   cacheName != CACHE_NAME;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });