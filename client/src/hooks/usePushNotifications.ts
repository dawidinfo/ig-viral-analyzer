import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push-Benachrichtigungen werden von deinem Browser nicht unterstützt');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Push-Benachrichtigungen aktiviert!');
        // Send a test notification
        new Notification('ReelSpy.ai', {
          body: 'Du erhältst jetzt Benachrichtigungen für neue Tipps!',
          icon: '/logo.svg',
          badge: '/logo.svg'
        });
        return true;
      } else if (result === 'denied') {
        toast.error('Push-Benachrichtigungen wurden blockiert');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Fehler beim Aktivieren der Benachrichtigungen');
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.log('Notifications not permitted');
      return;
    }

    try {
      new Notification(title, {
        icon: '/logo.svg',
        badge: '/logo.svg',
        ...options
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [permission]);

  // Daily tips that can be sent as notifications
  const dailyTips = [
    {
      title: '💡 Hook-Tipp des Tages',
      body: 'Starte dein Reel mit einer kontroversen Aussage - das steigert die Watch Time um bis zu 40%!'
    },
    {
      title: '📊 Analyse-Reminder',
      body: 'Hast du heute schon deine Top-Performer analysiert? Finde heraus, was viral geht!'
    },
    {
      title: '🎯 Content-Tipp',
      body: 'Die beste Posting-Zeit ist zwischen 18-21 Uhr. Plane deine Reels entsprechend!'
    },
    {
      title: '🔥 Trend-Alert',
      body: 'Neue Trends entdeckt! Analysiere jetzt erfolgreiche Accounts in deiner Nische.'
    },
    {
      title: '⚡ Engagement-Boost',
      body: 'Antworte auf Kommentare in den ersten 30 Minuten - das pusht den Algorithmus!'
    },
    {
      title: '🎬 Reel-Tipp',
      body: 'Halte deine Reels unter 30 Sekunden für maximale Completion Rate.'
    },
    {
      title: '📈 Wachstums-Hack',
      body: 'Nutze 3-5 Hashtags statt 30 - weniger ist mehr beim Instagram-Algorithmus!'
    }
  ];

  const sendRandomTip = useCallback(() => {
    const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
    sendNotification(randomTip.title, { body: randomTip.body });
  }, [sendNotification, dailyTips]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    sendRandomTip,
    isEnabled: permission === 'granted'
  };
}
