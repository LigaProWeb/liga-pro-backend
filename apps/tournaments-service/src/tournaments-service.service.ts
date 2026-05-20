import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  TournamentRegistrationDto,
  TournamentTeamResultEvent,
  TournamentDto,
} from '@app/contracts';
import { firstValueFrom } from 'rxjs';
import { FixtureEntity } from './entities/fixture.entity';
import { PhaseEntity } from './entities/phase.entity';
import { TeamMemberEntity } from './entities/team-member.entity';
import { TeamEntity } from './entities/team.entity';
import { TournamentRegistrationEntity } from './entities/tournament-registration.entity';
import { TournamentEntity } from './entities/tournament.entity';

@Injectable()
export class TournamentsServiceService {
  constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsClient: ClientProxy,
    @InjectRepository(TournamentEntity)
    private readonly tournamentsRepository: Repository<TournamentEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
    @InjectRepository(TeamMemberEntity)
    private readonly teamMembersRepository: Repository<TeamMemberEntity>,
    @InjectRepository(TournamentRegistrationEntity)
    private readonly registrationsRepository: Repository<TournamentRegistrationEntity>,
    @InjectRepository(PhaseEntity)
    private readonly phasesRepository: Repository<PhaseEntity>,
    @InjectRepository(FixtureEntity)
    private readonly fixturesRepository: Repository<FixtureEntity>,
  ) {}

  async create(
    createTournamentDto: CreateTournamentDto,
  ): Promise<TournamentDto> {
    const tournament = await this.tournamentsRepository.save(
      this.tournamentsRepository.create({
        ...createTournamentDto,
        status: 'open',
      }),
    );

    return this.toDto(tournament);
  }

  async findAll(): Promise<TournamentDto[]> {
    const tournaments = await this.tournamentsRepository.find({
      order: { name: 'ASC' },
    });

    return Promise.all(tournaments.map((tournament) => this.toDto(tournament)));
  }

  async findById(id: string): Promise<TournamentDto | undefined> {
    const tournament = await this.tournamentsRepository.findOneBy({ id });

    if (!tournament) {
      return undefined;
    }

    return this.toDto(tournament);
  }

  async registerTeam(registerTeamDto: RegisterTeamDto): Promise<TournamentDto> {
    const tournament = await this.getTournamentOrThrow(
      registerTeamDto.tournamentId,
    );

    if (tournament.status !== 'open') {
      throw new BadRequestException('Registro de equipos cerrado');
    }

    const team = await this.teamsRepository.save(
      this.teamsRepository.create({
        name: registerTeamDto.team.name,
        captainId: registerTeamDto.team.captainId,
      }),
    );

    const members = registerTeamDto.team.memberIds.map((userId) =>
      this.teamMembersRepository.create({
        teamId: team.id,
        userId,
        requestStatus: 'approved',
      }),
    );

    await this.teamMembersRepository.save(members);

    await this.registrationsRepository.save(
      this.registrationsRepository.create({
        tournamentId: tournament.id,
        teamId: team.id,
        requestStatus: 'approved',
      }),
    );

    return this.toDto(tournament);
  }

  async generateFixture(
    generateFixtureDto: GenerateFixtureDto,
  ): Promise<TournamentDto> {
    const tournament = await this.getTournamentOrThrow(
      generateFixtureDto.tournamentId,
    );
    const teams = await this.findAcceptedTeams(tournament.id);

    if (tournament.format !== 'knockout') {
      throw new BadRequestException(
        'La generacion automatica de fixture por ahora solo soporta torneos knockout',
      );
    }

    if (teams.length < 2) {
      throw new BadRequestException(
        'Al menos dos equipos son requeridos para generar un fixture',
      );
    }

    if (!this.isPowerOfTwo(teams.length)) {
      throw new BadRequestException(
        'Torneos de eliminacion simple requieren 2, 4, 8, 16, etc. equipos',
      );
    }

    await this.fixturesRepository.delete({ tournamentId: tournament.id });

    tournament.status = 'in_progress';
    await this.tournamentsRepository.save(tournament);

    await this.createNextPhase(
      tournament,
      teams.map((team) => team.id),
    );

    return this.toDto(tournament);
  }

  async reportFixtureResult(
    reportFixtureResultDto: ReportFixtureResultDto,
  ): Promise<TournamentDto> {
    const tournament = await this.getTournamentOrThrow(
      reportFixtureResultDto.tournamentId,
    );
    const fixture = await this.getFixtureOrThrow(
      tournament.id,
      reportFixtureResultDto.fixtureId,
    );

    if (!fixture.teamAId || !fixture.teamBId) {
      throw new BadRequestException(
        'El fixture no tiene ambos equipos asignados',
      );
    }

    if (
      reportFixtureResultDto.globalScoreA ===
      reportFixtureResultDto.globalScoreB
    ) {
      throw new BadRequestException(
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

    const updatedFixture = await this.fixturesRepository.save(fixture);

    await this.emitTeamResultEvents(tournament, updatedFixture);
    await this.advanceBracketIfPhaseFinished(
      tournament,
      updatedFixture.phaseId,
    );

    const updatedTournament = await this.getTournamentOrThrow(tournament.id);

    return this.toDto(updatedTournament);
  }

  async handleMatchResultUpdated(
    event: MatchResultUpdatedEvent,
  ): Promise<void> {
    if (!event.tournamentId || !event.fixtureId) {
      return;
    }

    await this.reportFixtureResult({
      tournamentId: event.tournamentId,
      fixtureId: event.fixtureId,
      globalScoreA: event.globalScoreA ?? 0,
      globalScoreB: event.globalScoreB ?? 0,
    });
  }

  private async advanceBracketIfPhaseFinished(
    tournament: TournamentEntity,
    phaseId: number,
  ): Promise<void> {
    const phaseFixtures = await this.fixturesRepository.find({
      where: {
        tournamentId: tournament.id,
        phaseId,
      },
      order: {
        id: 'ASC',
      },
    });
    const allPhaseFixturesCompleted = phaseFixtures.every(
      (fixture) =>
        fixture.status === 'completed' && this.getWinnerTeamId(fixture),
    );

    if (!allPhaseFixturesCompleted) {
      return;
    }

    const winners = phaseFixtures.map(
      (fixture) => this.getWinnerTeamId(fixture)!,
    );

    if (winners.length === 1) {
      tournament.status = 'completed';
      await this.tournamentsRepository.save(tournament);

      const finalFixture = phaseFixtures[0];
      const champion = await this.getTeamOrThrow(winners[0]);

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

    const nextFixtures = await this.createNextPhase(tournament, winners);

    for (let index = 0; index < phaseFixtures.length; index += 2) {
      const nextFixture = nextFixtures[Math.floor(index / 2)];
      if (nextFixture) {
        phaseFixtures[index].nextFixtureId = nextFixture.id;
        if (phaseFixtures[index + 1]) {
          phaseFixtures[index + 1].nextFixtureId = nextFixture.id;
        }
      }
    }

    await this.fixturesRepository.save(phaseFixtures);
  }

  private async createNextPhase(
    tournament: TournamentEntity,
    teamIds: string[],
  ): Promise<FixtureEntity[]> {
    const phase = await this.findOrCreatePhase(
      this.getPhaseName(teamIds.length),
    );
    const fixtures: FixtureEntity[] = [];

    for (let index = 0; index < teamIds.length; index += 2) {
      const teamAId = teamIds[index];
      const teamBId = teamIds[index + 1];

      if (!teamBId) {
        continue;
      }

      fixtures.push(
        this.fixturesRepository.create({
          tournamentId: tournament.id,
          phaseId: phase.id,
          teamAId,
          teamBId,
          globalScoreA: 0,
          globalScoreB: 0,
          status: 'pending',
        }),
      );
    }

    return this.fixturesRepository.save(fixtures);
  }

  private async findOrCreatePhase(name: string): Promise<PhaseEntity> {
    const existingPhase = await this.phasesRepository.findOneBy({ name });

    if (existingPhase) {
      return existingPhase;
    }

    return this.phasesRepository.save(this.phasesRepository.create({ name }));
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

  private async emitTeamResultEvents(
    tournament: TournamentEntity,
    fixture: FixtureEntity,
  ): Promise<void> {
    const winnerId = this.getWinnerTeamId(fixture);
    const loserId =
      fixture.teamAId === winnerId ? fixture.teamBId : fixture.teamAId;

    if (!winnerId || !loserId) {
      return;
    }

    const [winner, loser] = await Promise.all([
      this.getTeamOrThrow(winnerId),
      this.getTeamOrThrow(loserId),
    ]);

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

  private async getTournamentOrThrow(
    tournamentId: string,
  ): Promise<TournamentEntity> {
    const tournament = await this.tournamentsRepository.findOneBy({
      id: tournamentId,
    });

    if (!tournament) {
      throw new BadRequestException(`Torneo ${tournamentId} no encontrado`);
    }

    return tournament;
  }

  private async getTeamOrThrow(teamId: string): Promise<TeamEntity> {
    const team = await this.teamsRepository.findOneBy({ id: teamId });

    if (!team) {
      throw new BadRequestException(`Equipo ${teamId} no encontrado`);
    }

    return team;
  }

  private async getFixtureOrThrow(
    tournamentId: string,
    fixtureId: string,
  ): Promise<FixtureEntity> {
    const fixture = await this.fixturesRepository.findOneBy({
      id: fixtureId,
      tournamentId,
    });

    if (!fixture) {
      throw new BadRequestException(`Fixture ${fixtureId} no encontrado`);
    }

    return fixture;
  }

  private async findAcceptedTeams(tournamentId: string): Promise<TeamEntity[]> {
    const registrations = await this.registrationsRepository.find({
      where: {
        tournamentId,
        requestStatus: 'approved',
      },
      order: {
        teamId: 'ASC',
      },
    });
    const teams = await Promise.all(
      registrations.map((registration) =>
        this.teamsRepository.findOneBy({ id: registration.teamId }),
      ),
    );

    return teams.filter((team): team is TeamEntity => Boolean(team));
  }

  private async toDto(tournament: TournamentEntity): Promise<TournamentDto> {
    const [registrations, fixtures] = await Promise.all([
      this.registrationsRepository.find({
        where: { tournamentId: tournament.id },
        order: { teamId: 'ASC' },
      }),
      this.fixturesRepository.find({
        where: { tournamentId: tournament.id },
        order: { phaseId: 'ASC', id: 'ASC' },
      }),
    ]);
    const acceptedRegistrations = registrations.filter(
      (registration) => registration.requestStatus === 'approved',
    );
    const [teams, phases] = await Promise.all([
      this.toTeamDtos(acceptedRegistrations),
      this.toPhaseDtos(fixtures),
    ]);

    return {
      id: tournament.id,
      name: tournament.name,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      sportId: tournament.sportId,
      organizerId: tournament.organizerId,
      format: tournament.format,
      currentTeams: teams.length,
      teams,
      registrations: registrations.map((registration) =>
        this.toRegistrationDto(registration),
      ),
      phases,
      fixtures: fixtures.map((fixture) => this.toFixtureDto(fixture)),
      status: tournament.status,
    };
  }

  private async toTeamDtos(
    registrations: TournamentRegistrationEntity[],
  ): Promise<TeamDto[]> {
    const teams = await Promise.all(
      registrations.map((registration) =>
        this.teamsRepository.findOneBy({ id: registration.teamId }),
      ),
    );

    return Promise.all(
      teams
        .filter((team): team is TeamEntity => Boolean(team))
        .map(async (team) => {
          const members = await this.teamMembersRepository.find({
            where: { teamId: team.id },
            order: { userId: 'ASC' },
          });

          return {
            id: team.id,
            name: team.name,
            captainId: team.captainId,
            members: members.map((member) => ({
              teamId: member.teamId,
              userId: member.userId,
              requestStatus: member.requestStatus,
            })),
          };
        }),
    );
  }

  private async toPhaseDtos(fixtures: FixtureEntity[]): Promise<PhaseDto[]> {
    const phaseIds = [...new Set(fixtures.map((fixture) => fixture.phaseId))];
    const phases = await Promise.all(
      phaseIds.map((phaseId) =>
        this.phasesRepository.findOneBy({ id: phaseId }),
      ),
    );

    return phases
      .filter((phase): phase is PhaseEntity => Boolean(phase))
      .map((phase) => ({
        id: phase.id,
        name: phase.name,
      }));
  }

  private toRegistrationDto(
    registration: TournamentRegistrationEntity,
  ): TournamentRegistrationDto {
    return {
      tournamentId: registration.tournamentId,
      teamId: registration.teamId,
      requestStatus: registration.requestStatus,
    };
  }

  private toFixtureDto(fixture: FixtureEntity): FixtureDto {
    return {
      id: fixture.id,
      tournamentId: fixture.tournamentId,
      phaseId: fixture.phaseId,
      teamAId: fixture.teamAId,
      teamBId: fixture.teamBId,
      nextFixtureId: fixture.nextFixtureId ?? undefined,
      globalScoreA: fixture.globalScoreA ?? 0,
      globalScoreB: fixture.globalScoreB ?? 0,
      winnerTeamId: this.getWinnerTeamId(fixture),
      status: fixture.status,
    };
  }

  private getWinnerTeamId(fixture: FixtureEntity): string | undefined {
    if (fixture.winnerTeamId) {
      return fixture.winnerTeamId;
    }

    if (
      fixture.globalScoreA === null ||
      fixture.globalScoreA === undefined ||
      fixture.globalScoreB === null ||
      fixture.globalScoreB === undefined ||
      fixture.globalScoreA === fixture.globalScoreB
    ) {
      return undefined;
    }

    return fixture.globalScoreA > fixture.globalScoreB
      ? fixture.teamAId
      : fixture.teamBId;
  }
}
