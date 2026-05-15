import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATIONS_SERVICE, TOURNAMENTS_EVENTS } from '@app/contracts';
import type {
  CreateTournamentDto,
  FixtureDto,
  GenerateFixtureDto,
  MatchResultUpdatedEvent,
  PhaseDto,
  RegisterTeamDto,
  ReportFixtureResultDto,
  TeamDto,
  TournamentTeamResultEvent,
  TournamentDto,
} from '@app/contracts';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TournamentsServiceService {
  private readonly tournaments: TournamentDto[] = [];

  constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsClient: ClientProxy,
  ) {}

  create(createTournamentDto: CreateTournamentDto): TournamentDto {
    const tournament: TournamentDto = {
      id: `tournament-${Date.now()}`,
      currentTeams: 0,
      teams: [],
      registrations: [],
      phases: [],
      fixtures: [],
      status: 'open',
      ...createTournamentDto,
    };

    this.tournaments.push(tournament);

    return tournament;
  }

  findAll(): TournamentDto[] {
    return this.tournaments;
  }

  findById(id: string): TournamentDto | undefined {
    return this.tournaments.find((tournament) => tournament.id === id);
  }

  registerTeam(registerTeamDto: RegisterTeamDto): TournamentDto {
    const tournament = this.getTournamentOrThrow(registerTeamDto.tournamentId);

    if (tournament.status !== 'open') {
      throw new Error('Registro de equipos cerrado');
    }

    const team: TeamDto = {
      id: `team-${Date.now()}-${tournament.teams.length + 1}`,
      name: registerTeamDto.team.name,
      captainId: registerTeamDto.team.captainId,
      members: registerTeamDto.team.memberIds.map((userId) => ({
        teamId: '',
        userId,
        requestStatus: 'accepted',
      })),
    };

    team.members = team.members.map((member) => ({
      ...member,
      teamId: team.id,
    }));

    tournament.teams.push(team);
    tournament.registrations.push({
      tournamentId: tournament.id,
      teamId: team.id,
      requestStatus: 'accepted',
    });
    tournament.currentTeams = tournament.teams.length;

    return tournament;
  }

  generateFixture(generateFixtureDto: GenerateFixtureDto): TournamentDto {
    const tournament = this.getTournamentOrThrow(
      generateFixtureDto.tournamentId,
    );

    if (tournament.teams.length < 2) {
      throw new Error(
        'Al menos dos equipos son requeridos para generar un fixture',
      );
    }

    if (!this.isPowerOfTwo(tournament.teams.length)) {
      throw new Error(
        'Torneos de eliminacion simple requieren 2, 4, 8, 16, etc. equipos',
      );
    }

    tournament.phases = [];
    tournament.fixtures = [];
    tournament.status = 'in_progress';

    this.createNextPhase(
      tournament,
      tournament.teams.map((team) => team.id),
    );

    return tournament;
  }

  reportFixtureResult(
    reportFixtureResultDto: ReportFixtureResultDto,
  ): TournamentDto {
    const tournament = this.getTournamentOrThrow(
      reportFixtureResultDto.tournamentId,
    );
    const fixture = this.getFixtureOrThrow(
      tournament,
      reportFixtureResultDto.fixtureId,
    );

    if (!fixture.teamAId || !fixture.teamBId) {
      throw new Error('El fixture no tiene ambos equipos asignados');
    }

    if (
      reportFixtureResultDto.globalScoreA ===
      reportFixtureResultDto.globalScoreB
    ) {
      throw new Error(
        'Los fixtures de eliminacion simple no pueden terminar empatados',
      );
    }

    fixture.globalScoreA = reportFixtureResultDto.globalScoreA;
    fixture.globalScoreB = reportFixtureResultDto.globalScoreB;
    fixture.winnerTeamId =
      fixture.globalScoreA > fixture.globalScoreB
        ? fixture.teamAId
        : fixture.teamBId;
    fixture.status = 'completed';

    this.emitTeamResultEvents(tournament, fixture);
    this.advanceBracketIfPhaseFinished(tournament, fixture.phaseId);

    return tournament;
  }

  handleMatchResultUpdated(event: MatchResultUpdatedEvent): void {
    if (!event.tournamentId || !event.fixtureId) {
      return;
    }

    this.reportFixtureResult({
      tournamentId: event.tournamentId,
      fixtureId: event.fixtureId,
      globalScoreA: event.teamAScore,
      globalScoreB: event.teamBScore,
    });
  }

  private advanceBracketIfPhaseFinished(
    tournament: TournamentDto,
    phaseId: number,
  ): void {
    const phaseFixtures = tournament.fixtures.filter(
      (fixture) => fixture.phaseId === phaseId,
    );
    const allPhaseFixturesCompleted = phaseFixtures.every(
      (fixture) => fixture.status === 'completed' && fixture.winnerTeamId,
    );

    if (!allPhaseFixturesCompleted) {
      return;
    }

    const winners = phaseFixtures.map((fixture) => fixture.winnerTeamId!);

    if (winners.length === 1) {
      tournament.status = 'completed';
      const finalFixture = phaseFixtures[0];
      const champion = this.getTeamOrThrow(tournament, winners[0]);
      this.emitTournamentEvent(TOURNAMENTS_EVENTS.COMPLETED, {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        fixtureId: finalFixture.id,
        teamId: champion.id,
        teamName: champion.name,
        captainId: champion.captainId,
      });
      return;
    }

    const nextFixtures = this.createNextPhase(tournament, winners);

    for (let index = 0; index < phaseFixtures.length; index += 2) {
      const nextFixture = nextFixtures[Math.floor(index / 2)];
      if (nextFixture) {
        phaseFixtures[index].nextFixtureId = nextFixture.id;
        if (phaseFixtures[index + 1]) {
          phaseFixtures[index + 1].nextFixtureId = nextFixture.id;
        }
      }
    }
  }

  private createNextPhase(
    tournament: TournamentDto,
    teamIds: string[],
  ): FixtureDto[] {
    const phase: PhaseDto = {
      id: tournament.phases.length + 1,
      name: this.getPhaseName(teamIds.length),
    };

    tournament.phases.push(phase);

    const fixtures: FixtureDto[] = [];

    for (let index = 0; index < teamIds.length; index += 2) {
      const teamAId = teamIds[index];
      const teamBId = teamIds[index + 1];

      if (!teamBId) {
        continue;
      }

      const fixture: FixtureDto = {
        id: `fixture-${Date.now()}-${phase.id}-${fixtures.length + 1}`,
        tournamentId: tournament.id,
        phaseId: phase.id,
        teamAId,
        teamBId,
        globalScoreA: 0,
        globalScoreB: 0,
        status: 'pending',
      };

      fixtures.push(fixture);
      tournament.fixtures.push(fixture);
    }

    return fixtures;
  }

  private getPhaseName(teamCount: number): string {
    if (teamCount <= 2) {
      return 'Final';
    }

    if (teamCount <= 4) {
      return 'Semifinal';
    }

    if (teamCount <= 8) {
      return 'Cuartos de final';
    }

    if (teamCount <= 16) {
      return 'Octavos de final';
    }

    return `Ronda de ${teamCount}`;
  }

  private isPowerOfTwo(value: number): boolean {
    return value > 0 && (value & (value - 1)) === 0;
  }

  private emitTeamResultEvents(
    tournament: TournamentDto,
    fixture: FixtureDto,
  ): void {
    const winnerId = fixture.winnerTeamId;
    const loserId =
      fixture.teamAId === winnerId ? fixture.teamBId : fixture.teamAId;

    if (!winnerId || !loserId) {
      return;
    }

    const winner = this.getTeamOrThrow(tournament, winnerId);
    const loser = this.getTeamOrThrow(tournament, loserId);

    this.emitTournamentEvent(TOURNAMENTS_EVENTS.TEAM_ADVANCED, {
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      fixtureId: fixture.id,
      teamId: winner.id,
      teamName: winner.name,
      captainId: winner.captainId,
    });

    this.emitTournamentEvent(TOURNAMENTS_EVENTS.TEAM_ELIMINATED, {
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      fixtureId: fixture.id,
      teamId: loser.id,
      teamName: loser.name,
      captainId: loser.captainId,
    });
  }

  private emitTournamentEvent(
    pattern: string,
    payload: TournamentTeamResultEvent,
  ): void {
    void firstValueFrom(this.notificationsClient.emit(pattern, payload)).catch(
      (error: unknown) => {
        console.error(
          'No se pudo emitir el evento de notificacion del torneo:',
          error,
        );
      },
    );
  }

  private getTeamOrThrow(tournament: TournamentDto, teamId: string): TeamDto {
    const team = tournament.teams.find(
      (currentTeam) => currentTeam.id === teamId,
    );

    if (!team) {
      throw new Error(`Equipo ${teamId} no encontrado`);
    }

    return team;
  }

  private getTournamentOrThrow(tournamentId: string): TournamentDto {
    const tournament = this.findById(tournamentId);

    if (!tournament) {
      throw new Error(`Torneo ${tournamentId} no encontrado`);
    }

    return tournament;
  }

  private getFixtureOrThrow(
    tournament: TournamentDto,
    fixtureId: string,
  ): FixtureDto {
    const fixture = tournament.fixtures.find(
      (currentFixture) => currentFixture.id === fixtureId,
    );

    if (!fixture) {
      throw new Error(`Fixture ${fixtureId} no encontrado`);
    }

    return fixture;
  }
}
