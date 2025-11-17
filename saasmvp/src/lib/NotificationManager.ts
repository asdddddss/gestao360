/**
 * Utilitário para gerenciar notificações push na PWA
 * Suporta notificações locais e remotas
 */

interface NotificationOptions {
  title: string;
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
    data?: Record<string, any>;
  };
}

class NotificationManager {
  /**
   * Solicita permissão do usuário para notificações
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Navegador não suporta Notification API');
      return 'denied';
    }

    if (Notification.permission !== 'default') {
      return Notification.permission;
    }

    return Notification.requestPermission();
  }

  /**
   * Envia uma notificação local
   */
  static async sendNotification(
    title: string,
    options?: NotificationOptions['options']
  ): Promise<void> {
    const permission = await this.requestPermission();

    if (permission !== 'granted') {
      console.warn('Permissão de notificação negada');
      return;
    }

    // Se Service Worker está disponível, use-o
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options,
      });
    } else {
      // Fallback para API de Notification direta
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      });
    }
  }

  /**
   * Notificação de novo agendamento
   */
  static async notifyNewAppointment(appointmentData: {
    client: string;
    date: string;
    time: string;
  }): Promise<void> {
    await this.sendNotification('Novo Agendamento', {
      body: `${appointmentData.client} - ${appointmentData.date} às ${appointmentData.time}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'appointment',
      actions: [
        {
          action: 'view',
          title: 'Ver Detalhes',
          icon: '/icons/icon-192x192.png',
        },
        {
          action: 'dismiss',
          title: 'Descartar',
          icon: '/icons/icon-192x192.png',
        },
      ],
      data: appointmentData,
    });
  }

  /**
   * Notificação de lembrete de agendamento
   */
  static async notifyAppointmentReminder(appointmentData: {
    client: string;
    time: string;
  }): Promise<void> {
    await this.sendNotification('⏰ Agendamento em 15 minutos', {
      body: `${appointmentData.client} às ${appointmentData.time}`,
      icon: '/icons/icon-192x192.png',
      tag: 'appointment-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'confirm',
          title: 'Confirmar',
        },
        {
          action: 'reschedule',
          title: 'Reagendar',
        },
      ],
      data: appointmentData,
    });
  }

  /**
   * Notificação de transação financeira
   */
  static async notifyTransaction(transactionData: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
  }): Promise<void> {
    const typeLabel = transactionData.type === 'income' ? '💰 Entrada' : '💸 Saída';
    const currency = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(transactionData.amount);

    await this.sendNotification(`${typeLabel} - ${currency}`, {
      body: transactionData.description,
      icon: '/icons/icon-192x192.png',
      tag: 'transaction',
      data: transactionData,
    });
  }

  /**
   * Notificação de sincronização
   */
  static async notifySyncStatus(
    status: 'started' | 'completed' | 'error',
    message?: string
  ): Promise<void> {
    const titles = {
      started: '🔄 Sincronizando...',
      completed: '✅ Sincronização concluída',
      error: '❌ Erro na sincronização',
    };

    await this.sendNotification(titles[status], {
      body: message,
      icon: '/icons/icon-192x192.png',
      tag: 'sync',
    });
  }

  /**
   * Notificação de atualização da app
   */
  static async notifyAppUpdate(): Promise<void> {
    await this.sendNotification('🎉 Nova versão disponível!', {
      body: 'Clique para atualizar o Gestão 360',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'update',
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: 'Atualizar Agora',
        },
        {
          action: 'dismiss',
          title: 'Depois',
        },
      ],
    });
  }

  /**
   * Notificação genérica
   */
  static async notifyGeneric(
    title: string,
    body?: string,
    tag?: string
  ): Promise<void> {
    await this.sendNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: tag || 'generic',
    });
  }

  /**
   * Limpa todas as notificações
   */
  static async clearAll(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        const notifications = await registration.getNotifications();
        notifications.forEach((notification) => notification.close());
      }
    }
  }

  /**
   * Agenda notificação para um tempo específico
   */
  static scheduleNotification(
    millisFromNow: number,
    title: string,
    options?: NotificationOptions['options']
  ): ReturnType<typeof setTimeout> {
    return setTimeout(() => {
      this.sendNotification(title, options);
    }, millisFromNow);
  }

  /**
   * Solicita permissão de notificação ao abrir o app
   */
  static async checkAndRequestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Permissão de notificação foi negada permanentemente');
      return false;
    }

    const permission = await this.requestPermission();
    return permission === 'granted';
  }
}

export default NotificationManager;

/**
 * Exemplos de uso:
 * 
 * // Solicitar permissão
 * await NotificationManager.checkAndRequestPermission();
 * 
 * // Notificar novo agendamento
 * await NotificationManager.notifyNewAppointment({
 *   client: 'João Silva',
 *   date: '15/11/2025',
 *   time: '14:00'
 * });
 * 
 * // Notificar transação
 * await NotificationManager.notifyTransaction({
 *   type: 'income',
 *   amount: 150.00,
 *   description: 'Corte de cabelo'
 * });
 * 
 * // Agendar notificação para 15 minutos
 * NotificationManager.scheduleNotification(
 *   15 * 60 * 1000,
 *   'Agendamento em 15 minutos'
 * );
 */
