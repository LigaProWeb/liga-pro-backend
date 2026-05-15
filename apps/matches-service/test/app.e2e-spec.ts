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
  MatchDto,
  UpdateMatchDto,
  UpdateResultDto,
} from '@app/contracts';

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
      sport: 'football',
      title: 'Test Match',
      location: 'Stadium',
      date: '2026-05-15',
      maxPlayers: 22,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    expect(match).toBeDefined();
    expect(match.id).toContain('match-');
    expect(match.title).toBe('Test Match');
    expect(match.status).toBe('open');
  });

  it('should find all matches', async () => {
    const matches: MatchDto[] = await client
      .send(MATCHES_PATTERNS.FIND_ALL, {})
      .toPromise();

    expect(Array.isArray(matches)).toBe(true);
  });

  it('should update a match', async () => {
    // First create a match
    const createDto: CreateMatchDto = {
      sport: 'football',
      title: 'Test Match',
      location: 'Stadium',
      date: '2026-05-15',
      maxPlayers: 22,
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

  it('should delete a match', async () => {
    // Create a match
    const createDto: CreateMatchDto = {
      sport: 'football',
      title: 'Test Match',
      location: 'Stadium',
      date: '2026-05-15',
      maxPlayers: 22,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    // Delete it
    await client.send(MATCHES_PATTERNS.DELETE, match.id).toPromise();

    // Try to find all, should not include the deleted one
    const matches: MatchDto[] = await client
      .send(MATCHES_PATTERNS.FIND_ALL, {})
      .toPromise();

    expect(matches.find((m) => m.id === match.id)).toBeUndefined();
  });

  it('should update result of a match', async () => {
    // Create a match
    const createDto: CreateMatchDto = {
      sport: 'football',
      title: 'Test Match',
      location: 'Stadium',
      date: '2026-05-15',
      maxPlayers: 22,
      organizerId: 'user1',
    };

    const match: MatchDto = await client
      .send(MATCHES_PATTERNS.CREATE, createDto)
      .toPromise();

    const resultDto: UpdateResultDto = {
      id: match.id,
      teamAScore: 2,
      teamBScore: 1,
    };

    const updatedMatch: MatchDto = await client
      .send(MATCHES_PATTERNS.UPDATE_RESULT, resultDto)
      .toPromise();

    expect(updatedMatch.status).toBe('completed');
    expect(updatedMatch.result).toEqual({ teamA: 2, teamB: 1 });
  });
});
