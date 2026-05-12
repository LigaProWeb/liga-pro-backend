import { Injectable } from '@nestjs/common';
import type { MatchDto, NotificationCreatedEvent } from '@app/contracts';

@Injectable()
export class NotificationsServiceService {
  private readonly notifications: NotificationCreatedEvent[] = [];

  createFromMatchCreated(match: MatchDto): NotificationCreatedEvent {
    const notification: NotificationCreatedEvent = {
      id: `notification-${Date.now()}`,
      userId: match.organizerId,
      title: 'Partido creado',
      message: `Se creo el partido "${match.title}" en ${match.location}.`,
      createdAt: new Date().toISOString(),
      metadata: {
        event: 'match.created',
        matchId: match.id,
      },
    };

    this.notifications.push(notification);
    console.log('Notification stored:', notification);

    return notification;
  }

  findAll(): NotificationCreatedEvent[] {
    return this.notifications;
  }
}
