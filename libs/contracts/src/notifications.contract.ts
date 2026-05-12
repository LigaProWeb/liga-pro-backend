export const NOTIFICATIONS_SERVICE = 'NOTIFICATIONS_SERVICE';

export const NOTIFICATIONS_EVENTS = {
  CREATED: 'notification.created',
} as const;

export interface NotificationCreatedEvent {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
