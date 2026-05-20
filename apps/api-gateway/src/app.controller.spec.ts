import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appServiceMock = {
    getHello: jest.fn(),
    findMatchById: jest.fn(),
    updateMatch: jest.fn(),
    deleteMatch: jest.fn(),
    cancelMatch: jest.fn(),
    joinMatch: jest.fn(),
    leaveMatch: jest.fn(),
    updateMatchResult: jest.fn(),
  } satisfies Partial<Record<keyof AppService, jest.Mock>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    appServiceMock.getHello.mockReturnValue('Liga Pro API Gateway');

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });


  describe('matches routes', () => {
    it('delegates match lookup by id', async () => {
      appServiceMock.findMatchById.mockResolvedValue({ id: 'match-id' });

      await expect(appController.findMatchById('match-id')).resolves.toEqual({
        id: 'match-id',
      });
      expect(appServiceMock.findMatchById).toHaveBeenCalledWith('match-id');
    });

    it('merges path id into match update body', async () => {
      appServiceMock.updateMatch.mockResolvedValue({ id: 'match-id' });

      await appController.updateMatch('match-id', {
        title: 'Nuevo titulo',
        maxPlayers: 8,
      });

      expect(appServiceMock.updateMatch).toHaveBeenCalledWith({
        id: 'match-id',
        title: 'Nuevo titulo',
        maxPlayers: 8,
      });
    });

    it('delegates match deletion', async () => {
      appServiceMock.deleteMatch.mockResolvedValue(undefined);

      await expect(
        appController.deleteMatch('match-id'),
      ).resolves.toBeUndefined();
      expect(appServiceMock.deleteMatch).toHaveBeenCalledWith('match-id');
    });

    it('delegates match cancellation', async () => {
      appServiceMock.cancelMatch.mockResolvedValue({ id: 'match-id' });

      await appController.cancelMatch('match-id');

      expect(appServiceMock.cancelMatch).toHaveBeenCalledWith('match-id');
    });

    it('merges path id into join body', async () => {
      appServiceMock.joinMatch.mockResolvedValue({ id: 'match-id' });

      await appController.joinMatch('match-id', {
        userId: 'user-id',
      });

      expect(appServiceMock.joinMatch).toHaveBeenCalledWith({
        matchId: 'match-id',
        userId: 'user-id',
      });
    });

    it('merges path id into leave body', async () => {
      appServiceMock.leaveMatch.mockResolvedValue({ id: 'match-id' });

      await appController.leaveMatch('match-id', {
        userId: 'user-id',
      });

      expect(appServiceMock.leaveMatch).toHaveBeenCalledWith({
        matchId: 'match-id',
        userId: 'user-id',
      });
    });

    it('merges path id into result update body', async () => {
      appServiceMock.updateMatchResult.mockResolvedValue({ id: 'match-id' });

      await appController.updateMatchResult('match-id', {
        globalScoreA: 2,
        globalScoreB: 1,
      });

      expect(appServiceMock.updateMatchResult).toHaveBeenCalledWith({
        id: 'match-id',
        globalScoreA: 2,
        globalScoreB: 1,
      });
    });
  });
});
