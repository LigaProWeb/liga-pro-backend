import { Injectable } from '@nestjs/common';
import type { CreateTournamentDto, TournamentDto } from '@app/contracts';

@Injectable()
export class TournamentsServiceService {
  private readonly tournaments: TournamentDto[] = [];

  create(createTournamentDto: CreateTournamentDto): TournamentDto {
    const tournament: TournamentDto = {
      id: `tournament-${Date.now()}`,
      currentTeams: 0,
      teams: [],
      status: 'open',
      ...createTournamentDto,
    };

    this.tournaments.push(tournament);

    return tournament;
  }

  findAll(): TournamentDto[] {
    return this.tournaments;
  }
}
