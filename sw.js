const CACHE_NAME = 'todo-cache-v1';
const urlsToCache = [
  '/ToDoList-PWA/',
  '/ToDoList-PWA/index.html',
  '/ToDoList-PWA/css/styles.css',
  '/ToDoList-PWA/js/app.js',
  '/ToDoList-PWA/icon-192x192.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Ошибка кеширования:', err))
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
