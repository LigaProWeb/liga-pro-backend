import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { MATCHES_EVENTS } from '@app/contracts';
import type { MatchDto } from '@app/contracts';
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
}
