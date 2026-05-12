import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MATCHES_EVENTS, NOTIFICATIONS_SERVICE } from '@app/contracts';
import type { CreateMatchDto, MatchDto } from '@app/contracts';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MatchesServiceService {
  private readonly matches: MatchDto[] = [];

  constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsClient: ClientProxy,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    const match: MatchDto = {
      id: `match-${Date.now()}`,
      currentPlayers: 1,
      status: 'open',
      ...createMatchDto,
    };

    this.matches.push(match);

    await firstValueFrom(
      this.notificationsClient.emit(MATCHES_EVENTS.CREATED, match),
    );

    return match;
  }

  findAll(): MatchDto[] {
    return this.matches;
  }
}
