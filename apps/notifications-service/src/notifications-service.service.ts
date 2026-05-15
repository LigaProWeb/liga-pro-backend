import { Injectable } from '@nestjs/common';
import {
  TOURNAMENTS_EVENTS,
  type MatchDto,
  type NotificationCreatedEvent,
  type TournamentTeamResultEvent,
} from '@app/contracts';

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

  createFromTournamentTeamAdvanced(
    event: TournamentTeamResultEvent,
  ): NotificationCreatedEvent {
    return this.createFromTournamentEvent(
      event,
      TOURNAMENTS_EVENTS.TEAM_ADVANCED,
      'Tu equipo avanzo de fase',
      `El equipo ${event.teamName} avanzo en ${event.tournamentName}.`,
    );
  }

  createFromTournamentTeamEliminated(
    event: TournamentTeamResultEvent,
  ): NotificationCreatedEvent {
    return this.createFromTournamentEvent(
      event,
      TOURNAMENTS_EVENTS.TEAM_ELIMINATED,
      'Tu equipo quedo eliminado',
      `El equipo ${event.teamName} quedo eliminado de ${event.tournamentName}.`,
    );
  }

  createFromTournamentCompleted(
    event: TournamentTeamResultEvent,
  ): NotificationCreatedEvent {
    return this.createFromTournamentEvent(
      event,
      TOURNAMENTS_EVENTS.COMPLETED,
      'Torneo finalizado',
      `El equipo ${event.teamName} gano ${event.tournamentName}.`,
    );
  }

  findAll(): NotificationCreatedEvent[] {
    return this.notifications;
  }

  private createFromTournamentEvent(
    event: TournamentTeamResultEvent,
    eventName: string,
    title: string,
    message: string,
  ): NotificationCreatedEvent {
    const notification: NotificationCreatedEvent = {
      id: `notification-${Date.now()}`,
      userId: event.captainId,
      title,
      message,
      createdAt: new Date().toISOString(),
      metadata: {
        event: eventName,
        tournamentId: event.tournamentId,
        fixtureId: event.fixtureId,
        teamId: event.teamId,
      },
    };

    this.notifications.push(notification);
    console.log('Notification stored:', notification);

    return notification;
  }
}
