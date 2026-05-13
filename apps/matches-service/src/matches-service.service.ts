import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MATCHES_EVENTS, NOTIFICATIONS_SERVICE } from '@app/contracts';
import type { CreateMatchDto, MatchDto, UpdateMatchDto, UpdateResultDto } from '@app/contracts';
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

  async update(updateMatchDto: UpdateMatchDto): Promise<MatchDto> {
    const matchIndex = this.matches.findIndex(m => m.id === updateMatchDto.id);
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }
    const match = this.matches[matchIndex];
    if (updateMatchDto.title !== undefined) match.title = updateMatchDto.title;
    if (updateMatchDto.location !== undefined) match.location = updateMatchDto.location;
    if (updateMatchDto.date !== undefined) match.date = updateMatchDto.date;
    if (updateMatchDto.maxPlayers !== undefined) match.maxPlayers = updateMatchDto.maxPlayers;
    return match;
  }

  async delete(id: string): Promise<void> {
    const matchIndex = this.matches.findIndex(m => m.id === id);
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }
    this.matches.splice(matchIndex, 1);
  }

  async updateResult(updateResultDto: UpdateResultDto): Promise<MatchDto> {
    const matchIndex = this.matches.findIndex(m => m.id === updateResultDto.id);
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }
    const match = this.matches[matchIndex];
    match.status = 'completed';
    match.result = { teamA: updateResultDto.teamAScore, teamB: updateResultDto.teamBScore };
    return match;
  }

  //logica
}
