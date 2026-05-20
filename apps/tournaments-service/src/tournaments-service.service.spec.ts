import { of } from 'rxjs';
import { TOURNAMENTS_EVENTS } from '@app/contracts';
import { FixtureEntity } from './entities/fixture.entity';
import { PhaseEntity } from './entities/phase.entity';
import { TeamMemberEntity } from './entities/team-member.entity';
import { TeamEntity } from './entities/team.entity';
import { TournamentRegistrationEntity } from './entities/tournament-registration.entity';
import { TournamentEntity } from './entities/tournament.entity';
import { TournamentsServiceService } from './tournaments-service.service';

type RepositoryMock<T extends Record<string, unknown>> = {
  rows: T[];
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findBy: jest.Mock;
  findOneBy: jest.Mock;
  delete: jest.Mock;
};

type RepositoryOptions<T> = {
  idField?: keyof T;
  idType?: 'uuid' | 'number';
  keyFields?: (keyof T)[];
};

const organizerId = '00000000-0000-4000-8000-000000000001';

describe('TournamentsServiceService', () => {
  let service: TournamentsServiceService;
  let emitMock: jest.Mock;

  beforeEach(() => {
    emitMock = jest.fn(() => of(true));
    const tournamentsRepository = createRepositoryMock<TournamentEntity>({
      idField: 'id',
    });
    const teamsRepository = createRepositoryMock<TeamEntity>({
      idField: 'id',
    });
    const teamMembersRepository = createRepositoryMock<TeamMemberEntity>({
      keyFields: ['teamId', 'userId'],
    });
    const registrationsRepository =
      createRepositoryMock<TournamentRegistrationEntity>({
        keyFields: ['tournamentId', 'teamId'],
      });
    const phasesRepository = createRepositoryMock<PhaseEntity>({
      idField: 'id',
      idType: 'number',
    });
    const fixturesRepository = createRepositoryMock<FixtureEntity>({
      idField: 'id',
    });

    service = new TournamentsServiceService(
      {
        emit: emitMock,
      } as never,
      tournamentsRepository as never,
      teamsRepository as never,
      teamMembersRepository as never,
      registrationsRepository as never,
      phasesRepository as never,
      fixturesRepository as never,
    );
  });

  it('creates a single elimination fixture and advances winners to the final', async () => {
    const tournament = await service.create({
      name: 'Torneo Apertura',
      startDate: '2026-05-20T18:00:00.000Z',
      endDate: '2026-05-25T22:00:00.000Z',
      sportId: 1,
      organizerId,
      format: 'knockout',
    });

    for (let index = 1; index <= 4; index += 1) {
      await service.registerTeam({
        tournamentId: tournament.id,
        team: {
          name: `Equipo ${index}`,
          captainId: uuid(index + 10),
          memberIds: [uuid(index + 10), uuid(index + 20)],
        },
      });
    }

    const generatedTournament = await service.generateFixture({
      tournamentId: tournament.id,
    });

    expect(generatedTournament.status).toBe('in_progress');
    expect(generatedTournament.phases).toEqual([{ id: 1, name: 'Semifinal' }]);
    expect(generatedTournament.fixtures).toHaveLength(2);
    expect(generatedTournament.fixtures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ phaseId: 1, status: 'pending' }),
      ]),
    );

    const [firstSemiFinal, secondSemiFinal] = generatedTournament.fixtures;

    const afterFirstResult = await service.reportFixtureResult({
      tournamentId: tournament.id,
      fixtureId: firstSemiFinal.id,
      globalScoreA: 2,
      globalScoreB: 1,
    });

    expect(afterFirstResult.fixtures).toHaveLength(2);
    expect(afterFirstResult.phases).toHaveLength(1);

    const afterSecondResult = await service.reportFixtureResult({
      tournamentId: tournament.id,
      fixtureId: secondSemiFinal.id,
      globalScoreA: 0,
      globalScoreB: 3,
    });

    const finalFixture = afterSecondResult.fixtures.find(
      (fixture) => fixture.phaseId === 2,
    );

    expect(afterSecondResult.status).toBe('in_progress');
    expect(afterSecondResult.phases).toEqual([
      { id: 1, name: 'Semifinal' },
      { id: 2, name: 'Final' },
    ]);
    expect(finalFixture).toEqual(
      expect.objectContaining({
        phaseId: 2,
        status: 'pending',
        teamAId: firstSemiFinal.teamAId,
        teamBId: secondSemiFinal.teamBId,
      }),
    );
    expect(afterSecondResult.fixtures[0].nextFixtureId).toBe(finalFixture?.id);
    expect(afterSecondResult.fixtures[1].nextFixtureId).toBe(finalFixture?.id);
    expect(emitMock).toHaveBeenCalledWith(
      TOURNAMENTS_EVENTS.TEAM_ADVANCED,
      expect.objectContaining({ teamId: firstSemiFinal.teamAId }),
    );
    expect(emitMock).toHaveBeenCalledWith(
      TOURNAMENTS_EVENTS.TEAM_ELIMINATED,
      expect.objectContaining({ teamId: firstSemiFinal.teamBId }),
    );
  });

  it('marks the tournament as completed when the final result is reported', async () => {
    const tournament = await service.create({
      name: 'Torneo Relampago',
      startDate: '2026-05-20T18:00:00.000Z',
      endDate: '2026-05-20T23:00:00.000Z',
      sportId: 2,
      organizerId,
      format: 'knockout',
    });

    for (let index = 1; index <= 2; index += 1) {
      await service.registerTeam({
        tournamentId: tournament.id,
        team: {
          name: `Equipo ${index}`,
          captainId: uuid(index + 30),
          memberIds: [uuid(index + 30), uuid(index + 40)],
        },
      });
    }

    const generatedTournament = await service.generateFixture({
      tournamentId: tournament.id,
    });
    const [finalFixture] = generatedTournament.fixtures;

    const completedTournament = await service.reportFixtureResult({
      tournamentId: tournament.id,
      fixtureId: finalFixture.id,
      globalScoreA: 4,
      globalScoreB: 2,
    });

    expect(completedTournament.status).toBe('completed');
    expect(completedTournament.fixtures[0]).toEqual(
      expect.objectContaining({
        status: 'completed',
        winnerTeamId: finalFixture.teamAId,
      }),
    );
    expect(emitMock).toHaveBeenCalledWith(
      TOURNAMENTS_EVENTS.COMPLETED,
      expect.objectContaining({ teamId: finalFixture.teamAId }),
    );
  });

  it('rejects tied fixture results in single elimination tournaments', async () => {
    const tournament = await service.create({
      name: 'Torneo Sin Empates',
      startDate: '2026-05-20T18:00:00.000Z',
      endDate: '2026-05-20T23:00:00.000Z',
      sportId: 1,
      organizerId,
      format: 'knockout',
    });

    for (let index = 1; index <= 2; index += 1) {
      await service.registerTeam({
        tournamentId: tournament.id,
        team: {
          name: `Equipo ${index}`,
          captainId: uuid(index + 50),
          memberIds: [uuid(index + 50), uuid(index + 60)],
        },
      });
    }

    const generatedTournament = await service.generateFixture({
      tournamentId: tournament.id,
    });

    await expect(
      service.reportFixtureResult({
        tournamentId: tournament.id,
        fixtureId: generatedTournament.fixtures[0].id,
        globalScoreA: 1,
        globalScoreB: 1,
      }),
    ).rejects.toThrow(
      'Los fixtures de eliminacion simple no pueden terminar empatados',
    );
  });
});

function createRepositoryMock<T extends Record<string, unknown>>({
  idField,
  idType = 'uuid',
  keyFields,
}: RepositoryOptions<T> = {}): RepositoryMock<T> {
  const rows: T[] = [];
  let nextId = 1;
  const keys = keyFields ?? (idField ? [idField] : []);

  const repository: RepositoryMock<T> = {
    rows,
    create: jest.fn((input: Partial<T> | Partial<T>[]) => {
      if (Array.isArray(input)) {
        return input.map((item) => ({ ...item }));
      }

      return { ...input };
    }),
    save: jest.fn(async (input: T | T[]) => {
      const items = Array.isArray(input) ? input : [input];
      const savedItems = items.map((item) => {
        if (idField && !item[idField]) {
          item[idField] = idType === 'number' ? nextId : uuid(nextId);
          nextId += 1;
        }

        const index = rows.findIndex((row) =>
          keys.every((key) => row[key] === item[key]),
        );

        if (index >= 0) {
          rows[index] = { ...rows[index], ...item };
          return rows[index];
        }

        rows.push(item);
        return item;
      });

      return Array.isArray(input) ? savedItems : savedItems[0];
    }),
    find: jest.fn(async (options?: { where?: Partial<T>; order?: object }) =>
      sortRows(
        rows.filter((row) => matchesWhere(row, options?.where)),
        options?.order,
      ),
    ),
    findBy: jest.fn(async (where: Partial<T>) =>
      rows.filter((row) => matchesWhere(row, where)),
    ),
    findOneBy: jest.fn(
      async (where: Partial<T>) =>
        rows.find((row) => matchesWhere(row, where)) ?? null,
    ),
    delete: jest.fn(async (where: Partial<T>) => {
      const initialLength = rows.length;
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        if (matchesWhere(rows[index], where)) {
          rows.splice(index, 1);
        }
      }

      return { affected: initialLength - rows.length };
    }),
  };

  return repository;
}

function matchesWhere<T extends Record<string, unknown>>(
  row: T,
  where?: Partial<T>,
): boolean {
  if (!where) {
    return true;
  }

  return Object.entries(where).every(([key, value]) => row[key] === value);
}

function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  order?: object,
): T[] {
  if (!order) {
    return [...rows];
  }

  const entries = Object.entries(order) as [keyof T, 'ASC' | 'DESC'][];

  return [...rows].sort((left, right) => {
    for (const [key, direction] of entries) {
      if (left[key] === right[key]) {
        continue;
      }

      const comparison = left[key] > right[key] ? 1 : -1;
      return direction === 'DESC' ? comparison * -1 : comparison;
    }

    return 0;
  });
}

function uuid(value: number): string {
  return `00000000-0000-4000-8000-${value.toString().padStart(12, '0')}`;
}
