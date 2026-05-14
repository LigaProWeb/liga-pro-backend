import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MATCHES_PATTERNS,
  MATCHES_SERVICE,
  TOURNAMENTS_PATTERNS,
  TOURNAMENTS_SERVICE,
} from '@app/contracts';
import type {
  CreateMatchDto,
  CreateTournamentDto,
  MatchDto,
  TournamentDto,
} from '@app/contracts';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject(MATCHES_SERVICE)
    private readonly matchesClient: ClientProxy,
    @Inject(TOURNAMENTS_SERVICE)
    private readonly tournamentsClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Liga Pro API Gateway';
  }

  createMatch(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return firstValueFrom(
      this.matchesClient.send<MatchDto>(
        MATCHES_PATTERNS.CREATE,
        createMatchDto,
      ),
    );
  }

  findMatches(): Promise<MatchDto[]> {
    return firstValueFrom(
      this.matchesClient.send<MatchDto[]>(MATCHES_PATTERNS.FIND_ALL, {}),
    );
  }

  createTournament(
    createTournamentDto: CreateTournamentDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.CREATE,
        createTournamentDto,
      ),
    );
  }

  findTournaments(): Promise<TournamentDto[]> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto[]>(
        TOURNAMENTS_PATTERNS.FIND_ALL,
        {},
      ),
    );
  }
}
