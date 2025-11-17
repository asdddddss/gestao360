import { useEffect, useState } from 'react';

interface UpdateEvent extends Event {
  detail?: {
    needRefresh?: boolean;
  };
}

export const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updateWaiting, setUpdateWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    let refreshing = false;

    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    const handleVueUpdated = (event: UpdateEvent) => {
      if (event.detail?.needRefresh) {
        setShowUpdatePrompt(true);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setUpdateWaiting(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });

      window.addEventListener('vueUpdated', handleVueUpdated);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        window.removeEventListener('vueUpdated', handleVueUpdated);
      };
    }
  }, []);

  const handleUpdate = () => {
    if (updateWaiting) {
      updateWaiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-brand-gold text-brand-dark rounded-lg shadow-lg p-4 max-w-sm z-50 animate-fade-in-up">
      <h3 className="font-semibold mb-2">Atualização Disponível</h3>
      <p className="text-sm mb-4">Uma nova versão do Gestão 360 está disponível!</p>
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-brand-dark text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
        >
          Atualizar Agora
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-opacity-20 bg-brand-dark text-brand-dark px-4 py-2 rounded hover:bg-opacity-30 transition"
        >
          Depois
        </button>
      </div>
    </div>
  );
};
