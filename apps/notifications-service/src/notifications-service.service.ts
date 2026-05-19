import { Injectable } from '@nestjs/common';
import {
  MATCHES_EVENTS,
  TOURNAMENTS_EVENTS,
  type MatchDto,
  type NotificationCreatedEvent,
  type TournamentTeamResultEvent,
} from '@app/contracts';

@Injectable()
export class NotificationsServiceService {
  private readonly notifications: NotificationCreatedEvent[] = [];

  createFromMatchCreated(match: MatchDto): NotificationCreatedEvent {
    return this.createFromMatchEvent(
      match,
      MATCHES_EVENTS.CREATED,
      'Partido creado',
      `Se creo el partido "${match.title}" en ${match.location}.`,
    );
  }

  createFromMatchUpdated(match: MatchDto): NotificationCreatedEvent {
    return this.createFromMatchEvent(
      match,
      MATCHES_EVENTS.UPDATED,
      'Partido actualizado',
      `Se actualizo el partido "${match.title}".`,
    );
  }

  createFromMatchDeleted(match: MatchDto): NotificationCreatedEvent {
    return this.createFromMatchEvent(
      match,
      MATCHES_EVENTS.DELETED,
      'Partido eliminado',
      `Se elimino el partido "${match.title}".`,
    );
  }

  createFromMatchCancelled(match: MatchDto): NotificationCreatedEvent {
    return this.createFromMatchEvent(
      match,
      MATCHES_EVENTS.CANCELLED,
      'Partido cancelado',
      `Se cancelo el partido "${match.title}".`,
    );
  }

  createFromMatchResultUpdated(match: MatchDto): NotificationCreatedEvent {
    return this.createFromMatchEvent(
      match,
      MATCHES_EVENTS.RESULT_UPDATED,
      'Resultado actualizado',
      `Se cargo el resultado del partido "${match.title}".`,
    );
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

  private createFromMatchEvent(
    match: MatchDto,
    eventName: string,
    title: string,
    message: string,
  ): NotificationCreatedEvent {
    const notification: NotificationCreatedEvent = {
      id: `notification-${Date.now()}`,
      userId: match.organizerId,
      title,
      message,
      createdAt: new Date().toISOString(),
      metadata: {
        event: eventName,
        matchId: match.id,
        status: match.status,
        globalScoreA: match.globalScoreA,
        globalScoreB: match.globalScoreB,
      },
    };

    this.notifications.push(notification);
    console.log('Notification stored:', notification);

    return notification;
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
