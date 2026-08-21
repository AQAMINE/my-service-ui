export type NotificationType = 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  detail: string;
  autoDismiss?: boolean;
  durationMs?: number;
}

export interface ShowNotificationOptions {
  type: NotificationType;
  title: string;
  detail: string;
  autoDismiss?: boolean;
  durationMs?: number;
}
