import { useEffect, useState } from 'react';

interface UpdatePrompt {
  waiting: ServiceWorkerContainer['controller'] | null;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorker = () => {
  const [updatePrompt, setUpdatePrompt] = useState<UpdatePrompt>({
    waiting: null,
    registration: null,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers não são suportados neste navegador');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registrado com sucesso:', registration);

        // Verificar atualizações a cada hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Ouvir por atualizações do Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Nova versão disponível
              setUpdatePrompt({
                waiting: newWorker,
                registration,
              });

              // Notificar o usuário sobre atualização disponível
              if ('Notification' in window) {
                new Notification('Gestão 360', {
                  body: 'Uma nova versão está disponível!',
                  icon: '/icons/icon-192x192.png',
                });
              }
            }
          });
        });
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    };

    registerServiceWorker();

    // Escutar por controlador change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const updateApp = () => {
    if (updatePrompt.waiting) {
      updatePrompt.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdatePrompt({ waiting: null, registration: null });
    }
  };

  const clearCache = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  const requestBackgroundSync = (tag: string) => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        (registration as any).sync.register(tag);
      });
    }
  };

  return {
    updatePrompt,
    updateApp,
    clearCache,
    requestBackgroundSync,
    hasUpdate: updatePrompt.waiting !== null,
  };
};
