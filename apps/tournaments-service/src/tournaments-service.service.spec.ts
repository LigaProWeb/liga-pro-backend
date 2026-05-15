import { of } from 'rxjs';
import { TOURNAMENTS_EVENTS } from '@app/contracts';
import { TournamentsServiceService } from './tournaments-service.service';

describe('TournamentsServiceService', () => {
  let service: TournamentsServiceService;
  let emitMock: jest.Mock;

  beforeEach(() => {
    emitMock = jest.fn(() => of(true));
    service = new TournamentsServiceService({
      emit: emitMock,
    } as never);
  });

  it('creates a single elimination fixture and advances winners to the final', () => {
    const tournament = service.create({
      name: 'Torneo Apertura',
      startDate: '2026-05-20T18:00:00.000Z',
      endDate: '2026-05-25T22:00:00.000Z',
      sportId: 1,
      organizerId: 'user-organizer',
      format: 'single_elimination',
    });

    for (let index = 1; index <= 4; index += 1) {
      service.registerTeam({
        tournamentId: tournament.id,
        team: {
          name: `Equipo ${index}`,
          captainId: `captain-${index}`,
          memberIds: [`captain-${index}`, `player-${index}`],
        },
      });
    }

    const generatedTournament = service.generateFixture({
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

    const afterFirstResult = service.reportFixtureResult({
      tournamentId: tournament.id,
      fixtureId: firstSemiFinal.id,
      globalScoreA: 2,
      globalScoreB: 1,
    });

    expect(afterFirstResult.fixtures).toHaveLength(2);
    expect(afterFirstResult.phases).toHaveLength(1);

    const afterSecondResult = service.reportFixtureResult({
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

  it('marks the tournament as completed when the final result is reported', () => {
    const tournament = service.create({
      name: 'Torneo Relampago',
      startDate: '2026-05-20T18:00:00.000Z',
      endDate: '2026-05-20T23:00:00.000Z',
      sportId: 2,
      organizerId: 'user-organizer',
      format: 'single_elimination',
    });

    for (let index = 1; index <= 2; index += 1) {
      service.registerTeam({
        tournamentId: tournament.id,
        team: {
          name: `Equipo ${index}`,
          captainId: `captain-${index}`,
          memberIds: [`captain-${index}`, `player-${index}`],
        },
      });
    }

    const generatedTournament = service.generateFixture({
      tournamentId: tournament.id,
    });
    const [finalFixture] = generatedTournament.fixtures;

    const completedTournament = service.reportFixtureResult({
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

  it('rejects tied fixture results in single elimination tournaments', () => {
    const tournament = service.create({
      name: 'Torneo Sin Empates',
      startDate: '2026-05-20T18:00:00.000Z',
      endDate: '2026-05-20T23:00:00.000Z',
      sportId: 1,
      organizerId: 'user-organizer',
      format: 'single_elimination',
    });

    for (let index = 1; index <= 2; index += 1) {
      service.registerTeam({
        tournamentId: tournament.id,
        team: {
          name: `Equipo ${index}`,
          captainId: `captain-${index}`,
          memberIds: [`captain-${index}`, `player-${index}`],
        },
      });
    }

    const generatedTournament = service.generateFixture({
      tournamentId: tournament.id,
    });

    expect(() =>
      service.reportFixtureResult({
        tournamentId: tournament.id,
        fixtureId: generatedTournament.fixtures[0].id,
        globalScoreA: 1,
        globalScoreB: 1,
      }),
    ).toThrow(
      'Los fixtures de eliminacion simple no pueden terminar empatados',
    );
  });
});
