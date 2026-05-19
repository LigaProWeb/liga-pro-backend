import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { of } from 'rxjs';
import { DataSource } from 'typeorm';
import { MatchesServiceService } from '../src/matches-service.service';
import { MatchEntity } from '../src/entities/match.entity';
import { MatchParticipantEntity } from '../src/entities/match-participant.entity';

describe('MatchesServiceService TypeORM integration', () => {
  jest.setTimeout(30000);

  let moduleRef: TestingModule;
  let service: MatchesServiceService;
  let dataSource: DataSource;

  const organizerId = '11111111-1111-4111-8111-111111111111';
  const participantId = '22222222-2222-4222-8222-222222222222';
  const titlePrefix = 'TypeORM Integration';

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('POSTGRES_HOST', 'localhost'),
            port: Number(configService.get<string>('POSTGRES_PORT', '5432')),
            username: configService.get<string>('POSTGRES_USER', 'postgres'),
            password: configService.get<string>(
              'POSTGRES_PASSWORD',
              'postgres',
            ),
            database: configService.get<string>('POSTGRES_DB', 'liga_pro'),
            schema: 'matches_svc',
            entities: [MatchEntity, MatchParticipantEntity],
            synchronize: false,
            retryAttempts: 0,
          }),
        }),
        TypeOrmModule.forFeature([MatchEntity, MatchParticipantEntity]),
      ],
      providers: [
        MatchesServiceService,
        {
          provide: NOTIFICATIONS_SERVICE,
          useValue: {
            emit: jest.fn(() => of(true)),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(MatchesServiceService);
    dataSource = moduleRef.get(getDataSourceToken());
  });

  beforeEach(async () => {
    await cleanupTestRows();
  });

  afterEach(async () => {
    if (dataSource) {
      await cleanupTestRows();
    }
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('persists a match and its approved organizer participant', async () => {
    const match = await service.create({
      title: `${titlePrefix} Create`,
      sportId: 1,
      organizerId,
      location: 'Mendoza',
      matchDate: '2026-05-20T20:00:00.000Z',
      maxPlayers: 4,
    });

    expect(match.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(match.currentPlayers).toBe(1);
    expect(match.participantIds).toEqual([organizerId]);

    const rows = await dataSource.query(
      'SELECT id, title FROM matches_svc.matches WHERE id = $1',
      [match.id],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe(`${titlePrefix} Create`);
  });

  it('updates participants and result through TypeORM repositories', async () => {
    const match = await service.create({
      title: `${titlePrefix} Flow`,
      sportId: 1,
      organizerId,
      location: 'Mendoza',
      matchDate: '2026-05-21T20:00:00.000Z',
      maxPlayers: 4,
    });

    const joinedMatch = await service.join({
      matchId: match.id,
      userId: participantId,
    });

    expect(joinedMatch.currentPlayers).toBe(2);
    expect(joinedMatch.participantIds).toEqual([organizerId, participantId]);

    const completedMatch = await service.updateResult({
      id: match.id,
      globalScoreA: 2,
      globalScoreB: 1,
    });

    expect(completedMatch.status).toBe('completed');
    expect(completedMatch.globalScoreA).toBe(2);
    expect(completedMatch.globalScoreB).toBe(1);
  });

  async function cleanupTestRows(): Promise<void> {
    await dataSource.query(
      'DELETE FROM matches_svc.matches WHERE title LIKE $1',
      [`${titlePrefix}%`],
    );
  }
});
