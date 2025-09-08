const CACHE_NAME = 'xiaohongshu-v1.3.1';
const urlsToCache = [
  '/',
  '/explore',
  '/publish',
  '/notification',
  '/user',
  '/static/js/app.js',
  '/static/css/app.css',
  '/logo.ico',
  '/manifest.json',
  '/src/utils/statusBar.js'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: 缓存文件');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: 安装完成');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: 安装失败', err);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 删除旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: 激活完成');
      return self.clients.claim();
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 过滤掉不支持的URL scheme
  const requestUrl = new URL(event.request.url);
  if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') {
    return;
  }

  // 过滤掉第三方域名（如Cloudflare analytics）
  if (!requestUrl.hostname.includes(location.hostname) && 
      !requestUrl.hostname.includes('localhost') &&
      !requestUrl.hostname.includes('127.0.0.1')) {
    return;
  }

  // 对于API请求，采用网络优先策略
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 如果网络请求成功，返回响应并更新缓存
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络失败时从缓存中获取
          return caches.match(event.request);
        })
    );
    return;
  }

  // 对于静态资源，采用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，直接返回
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request)
          .then(response => {
            // 检查是否是有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应并添加到缓存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              // 添加错误处理，防止缓存失败
              cache.put(event.request, responseToCache).catch(err => {
                console.warn('缓存失败:', event.request.url, err);
              });
            });

            return response;
          })
          .catch(err => {
            console.warn('网络请求失败:', event.request.url, err);
            throw err;
          });
      })
      .catch(() => {
        // 如果请求是页面且网络和缓存都失败，返回离线页面
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// 监听消息事件
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 推送通知事件
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '您有新的消息',
    icon: '/logo.ico',
    badge: '/logo.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: '查看',
        icon: '/logo.ico'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/logo.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('大红薯图文社区', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/explore')
    );
  } else if (event.action === 'close') {
    // 关闭通知，不执行其他操作
  } else {
    // 默认行为：打开应用主页
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
