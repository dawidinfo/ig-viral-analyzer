/**
 * Push Notifications Service
 * Handles browser notifications for viral account alerts
 */

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Send a notification
export function sendNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    onClick?: () => void;
  }
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    body: options?.body,
    icon: options?.icon || '/logo.svg',
    badge: options?.badge || '/logo.svg',
    tag: options?.tag,
    data: options?.data,
  });

  if (options?.onClick) {
    notification.onclick = () => {
      window.focus();
      options.onClick?.();
      notification.close();
    };
  }

  return notification;
}

// Viral alert notification
export function sendViralAlert(
  username: string,
  followerGrowth: number,
  newFollowers: number
): Notification | null {
  const growthPercent = followerGrowth.toFixed(1);
  
  return sendNotification(
    `🚀 @${username} geht viral!`,
    {
      body: `+${newFollowers.toLocaleString()} Follower (+${growthPercent}%) in den letzten 24h`,
      tag: `viral-${username}`,
      data: { username, type: 'viral_alert' },
      onClick: () => {
        window.location.href = `/analysis?username=${username}`;
      }
    }
  );
}

// Growth milestone notification
export function sendMilestoneAlert(
  username: string,
  milestone: string,
  followerCount: number
): Notification | null {
  return sendNotification(
    `🎉 @${username} erreicht ${milestone}!`,
    {
      body: `Jetzt bei ${followerCount.toLocaleString()} Followern`,
      tag: `milestone-${username}`,
      data: { username, type: 'milestone' },
      onClick: () => {
        window.location.href = `/analysis?username=${username}`;
      }
    }
  );
}

// Declining account warning
export function sendDeclineWarning(
  username: string,
  followerLoss: number,
  lossPercent: number
): Notification | null {
  return sendNotification(
    `⚠️ @${username} verliert Follower`,
    {
      body: `-${followerLoss.toLocaleString()} Follower (-${lossPercent.toFixed(1)}%) in den letzten 24h`,
      tag: `decline-${username}`,
      data: { username, type: 'decline_warning' },
      onClick: () => {
        window.location.href = `/analysis?username=${username}`;
      }
    }
  );
}

// Store notification preferences in localStorage
export function setNotificationPreference(enabled: boolean): void {
  localStorage.setItem('reelspy_notifications', enabled ? 'enabled' : 'disabled');
}

export function getNotificationPreference(): boolean {
  return localStorage.getItem('reelspy_notifications') !== 'disabled';
}
