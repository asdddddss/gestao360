/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'gestao360-v1';
const RUNTIME_CACHE = 'gestao360-runtime';
const IMAGE_CACHE = 'gestao360-images';
const API_CACHE = 'gestao360-api';

// Arquivos essenciais que devem ser cacheados na instalação
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Evento de instalação - cachear arquivos essenciais
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Evento de ativação - limpar caches antigos
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== IMAGE_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de fetch - Network First para API, Cache First para assets
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Estratégia para API do Supabase - Network First com fallback
  if (url.origin === 'https://supabase.com' || url.hostname.includes('supabase')) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar a resposta antes de colocá-la no cache
          const clonedResponse = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Se falhar, tentar o cache
          return caches.match(request).then((response) => {
            return response || new Response('API indisponível offline', { status: 503 });
          });
        })
    );
  }

  // Estratégia para imagens - Cache First
  if (request.destination === 'image') {
    return event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
    );
  }

  // Estratégia para outros recursos (JS, CSS, etc) - Stale While Revalidate
  return event.respondWith(
    caches.match(request).then((response) => {
      const fetchPromise = fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });

      return response || fetchPromise;
    })
  );
});

// Tratamento de mensagens do cliente
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});

// Sincronização em background
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }

  if (event.tag === 'sync-finance') {
    event.waitUntil(syncFinance());
  }
});

// Funções auxiliares de sincronização
async function syncAppointments() {
  try {
    // Aqui você pode implementar a sincronização de agendamentos
    console.log('Sincronizando agendamentos...');
  } catch (error) {
    console.error('Erro ao sincronizar agendamentos:', error);
    throw error;
  }
}

async function syncFinance() {
  try {
    // Aqui você pode implementar a sincronização de dados financeiros
    console.log('Sincronizando dados financeiros...');
  } catch (error) {
    console.error('Erro ao sincronizar finanças:', error);
    throw error;
  }
}
