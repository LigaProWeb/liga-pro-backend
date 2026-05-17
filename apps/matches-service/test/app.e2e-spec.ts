/// <reference types="jest" />

import { describe, it, beforeEach, expect, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { of } from 'rxjs';
import { MatchesServiceModule } from './../src/matches-service.module';
import { MATCHES_PATTERNS, NOTIFICATIONS_SERVICE } from '@app/contracts';
import type {
  CreateMatchDto,
  JoinMatchDto,
  LeaveMatchDto,
  MatchDto,
  UpdateMatchDto,
  UpdateResultDto,
} from '@app/contracts';

//PRUEBAS E2E: pruebas para toda la aplicación, verificando integración entre componentes y comportamiento esperado en escenarios reales
describe('MatchesServiceController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MatchesServiceModule],
    })
      .overrideProvider(NOTIFICATIONS_SERVICE)
      .useValue({
        emit: jest.fn(() => of(null)),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001,
      },
    });

    await app.startAllMicroservices();
    await app.init();

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001,
      },
    });
  });

  afterEach(async () => {
    await app.close();
    await client.close();
  });

  it('should create a match', async () => {
    const createDto: CreateMatchDto = {
      sportId: 1,
      title: 'Test Match',
      location: 'Stadium',
      matchDate: '2026-05-15T18:00:00Z',
      maxPlayers: 4,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    expect(match).toBeDefined();
    expect(match.id).toContain('match-');
    expect(match.title).toBe('Test Match');
    expect(match.status).toBe('open');
    expect(match.participantIds).toContain('user1');
    expect(match.currentPlayers).toBe(1);
  });

  it('should find all matches', async () => {
    const matches: MatchDto[] = await client
      .send(MATCHES_PATTERNS.FIND_ALL, {})
      .toPromise();

    expect(Array.isArray(matches)).toBe(true);
  });

  it('should find a match by id', async () => {
    const createDto: CreateMatchDto = {
      sportId: 1,
      title: 'Test Match',
      location: 'Stadium',
      matchDate: '2026-05-15T18:00:00Z',
      maxPlayers: 4,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    const foundMatch: MatchDto = await client
      .send(MATCHES_PATTERNS.FIND_BY_ID, match.id)
      .toPromise();

    expect(foundMatch).toBeDefined();
    expect(foundMatch.id).toBe(match.id);
  });

  it('should update a match', async () => {
    const createDto: CreateMatchDto = {
      sportId: 1,
      title: 'Test Match',
      location: 'Stadium',
      matchDate: '2026-05-15T18:00:00Z',
      maxPlayers: 4,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    const updateDto: UpdateMatchDto = {
      id: match.id,
      title: 'Updated Title',
      location: 'New Location',
    };

    const updatedMatch: MatchDto = await client
      .send(MATCHES_PATTERNS.UPDATE, updateDto)
      .toPromise();

    expect(updatedMatch.title).toBe('Updated Title');
    expect(updatedMatch.location).toBe('New Location');
  });

  it('should join and leave a match', async () => {
    const createDto: CreateMatchDto = {
      sportId: 1,
      title: 'Join Match',
      location: 'Stadium',
      matchDate: '2026-05-16T18:00:00Z',
      maxPlayers: 3,
      organizerId: 'organizer1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    const joinDto: JoinMatchDto = {
      matchId: match.id,
      userId: 'user2',
    };

    const joinedMatch: MatchDto = await client
      .send(MATCHES_PATTERNS.JOIN, joinDto)
      .toPromise();

    expect(joinedMatch.currentPlayers).toBe(2);
    expect(joinedMatch.participantIds).toContain('user2');

    const leaveDto: LeaveMatchDto = {
      matchId: match.id,
      userId: 'user2',
    };

    const leftMatch: MatchDto = await client
      .send(MATCHES_PATTERNS.LEAVE, leaveDto)
      .toPromise();

    expect(leftMatch.currentPlayers).toBe(1);
    expect(leftMatch.participantIds).not.toContain('user2');
  });

  it('should delete a match', async () => {
    const createDto: CreateMatchDto = {
      sportId: 1,
      title: 'Test Match',
      location: 'Stadium',
      matchDate: '2026-05-15T18:00:00Z',
      maxPlayers: 4,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    await client.send(MATCHES_PATTERNS.DELETE, match.id).toPromise();

    const matches: MatchDto[] = await client
      .send(MATCHES_PATTERNS.FIND_ALL, {})
      .toPromise();

    expect(matches.find((m) => m.id === match.id)).toBeUndefined();
  });

  it('should update result of a match', async () => {
    const createDto: CreateMatchDto = {
      sportId: 1,
      title: 'Test Match',
      location: 'Stadium',
      matchDate: '2026-05-15T18:00:00Z',
      maxPlayers: 4,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    const resultDto: UpdateResultDto = {
      id: match.id,
      globalScoreA: 2,
      globalScoreB: 1,
    };

    const updatedMatch: MatchDto = await client
      .send(MATCHES_PATTERNS.UPDATE_RESULT, resultDto)
      .toPromise();

    expect(updatedMatch.status).toBe('completed');
    expect(updatedMatch.globalScoreA).toBe(2);
    expect(updatedMatch.globalScoreB).toBe(1);
  });
});
