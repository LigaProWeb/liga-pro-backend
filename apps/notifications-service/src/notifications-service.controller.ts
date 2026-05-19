import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { MATCHES_EVENTS, TOURNAMENTS_EVENTS } from '@app/contracts';
import type { MatchDto, TournamentTeamResultEvent } from '@app/contracts';
import { NotificationsServiceService } from './notifications-service.service';

@Controller()
export class NotificationsServiceController {
  constructor(
    private readonly notificationsServiceService: NotificationsServiceService,
  ) {}

  @EventPattern(MATCHES_EVENTS.CREATED)
  handleMatchCreated(match: MatchDto): void {
    this.notificationsServiceService.createFromMatchCreated(match);
  }

  @EventPattern(MATCHES_EVENTS.UPDATED)
  handleMatchUpdated(match: MatchDto): void {
    this.notificationsServiceService.createFromMatchUpdated(match);
  }

  @EventPattern(MATCHES_EVENTS.DELETED)
  handleMatchDeleted(match: MatchDto): void {
    this.notificationsServiceService.createFromMatchDeleted(match);
  }

  @EventPattern(MATCHES_EVENTS.CANCELLED)
  handleMatchCancelled(match: MatchDto): void {
    this.notificationsServiceService.createFromMatchCancelled(match);
  }

  @EventPattern(MATCHES_EVENTS.RESULT_UPDATED)
  handleMatchResultUpdated(match: MatchDto): void {
    this.notificationsServiceService.createFromMatchResultUpdated(match);
  }

  @EventPattern(TOURNAMENTS_EVENTS.TEAM_ADVANCED)
  handleTournamentTeamAdvanced(event: TournamentTeamResultEvent): void {
    this.notificationsServiceService.createFromTournamentTeamAdvanced(event);
  }

  @EventPattern(TOURNAMENTS_EVENTS.TEAM_ELIMINATED)
  handleTournamentTeamEliminated(event: TournamentTeamResultEvent): void {
    this.notificationsServiceService.createFromTournamentTeamEliminated(event);
  }

  @EventPattern(TOURNAMENTS_EVENTS.COMPLETED)
  handleTournamentCompleted(event: TournamentTeamResultEvent): void {
    this.notificationsServiceService.createFromTournamentCompleted(event);
  }
}
