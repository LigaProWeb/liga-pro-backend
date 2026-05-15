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
  GenerateFixtureDto,
  MatchDto,
  RegisterTeamDto,
  ReportFixtureResultDto,
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

  findTournamentById(id: string): Promise<TournamentDto | undefined> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto | undefined>(
        TOURNAMENTS_PATTERNS.FIND_BY_ID,
        id,
      ),
    );
  }

  registerTournamentTeam(
    registerTeamDto: RegisterTeamDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.REGISTER_TEAM,
        registerTeamDto,
      ),
    );
  }

  generateTournamentFixture(
    generateFixtureDto: GenerateFixtureDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.GENERATE_FIXTURE,
        generateFixtureDto,
      ),
    );
  }

  reportTournamentFixtureResult(
    reportFixtureResultDto: ReportFixtureResultDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.REPORT_FIXTURE_RESULT,
        reportFixtureResultDto,
      ),
    );
  }
}
