import { of } from 'rxjs';
import { MATCHES_PATTERNS } from '@app/contracts';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let matchesSendMock: jest.Mock;

  beforeEach(() => {
    matchesSendMock = jest.fn(() => of({ id: 'match-id' }));
    service = new AppService(
      { send: matchesSendMock } as never,
      { send: jest.fn() } as never,
      { send: jest.fn() } as never,
    );
  });

  it('uses the match lookup pattern', async () => {
    await service.findMatchById('match-id');

    expect(matchesSendMock).toHaveBeenCalledWith(
      MATCHES_PATTERNS.FIND_BY_ID,
      'match-id',
    );
  });

  it('uses the match update pattern', async () => {
    const dto = { id: 'match-id', title: 'Nuevo titulo' };

    await service.updateMatch(dto);

    expect(matchesSendMock).toHaveBeenCalledWith(MATCHES_PATTERNS.UPDATE, dto);
  });

  it('uses the match delete pattern', async () => {
    await service.deleteMatch('match-id');

    expect(matchesSendMock).toHaveBeenCalledWith(
      MATCHES_PATTERNS.DELETE,
      'match-id',
    );
  });

  it('uses the match cancel pattern', async () => {
    await service.cancelMatch('match-id');

    expect(matchesSendMock).toHaveBeenCalledWith(
      MATCHES_PATTERNS.CANCEL,
      'match-id',
    );
  });

  it('uses the match join pattern', async () => {
    const dto = { matchId: 'match-id', userId: 'user-id' };

    await service.joinMatch(dto);

    expect(matchesSendMock).toHaveBeenCalledWith(MATCHES_PATTERNS.JOIN, dto);
  });

  it('uses the match leave pattern', async () => {
    const dto = { matchId: 'match-id', userId: 'user-id' };

    await service.leaveMatch(dto);

    expect(matchesSendMock).toHaveBeenCalledWith(MATCHES_PATTERNS.LEAVE, dto);
  });

  it('uses the match result update pattern', async () => {
    const dto = { id: 'match-id', globalScoreA: 2, globalScoreB: 1 };

    await service.updateMatchResult(dto);

    expect(matchesSendMock).toHaveBeenCalledWith(
      MATCHES_PATTERNS.UPDATE_RESULT,
      dto,
    );
  });
});
