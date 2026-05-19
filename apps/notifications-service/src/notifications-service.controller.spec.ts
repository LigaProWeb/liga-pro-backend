import { Test, TestingModule } from '@nestjs/testing';
import { MatchDto } from '@app/contracts';
import { NotificationsServiceController } from './notifications-service.controller';
import { NotificationsServiceService } from './notifications-service.service';

describe('NotificationsServiceController', () => {
  let notificationsServiceController: NotificationsServiceController;
  let notificationsServiceService: NotificationsServiceService;
  const match: MatchDto = {
    id: 'match-1',
    sportId: 1,
    title: 'Futbol 5',
    location: 'Mendoza',
    matchDate: '2026-05-12T20:00:00.000Z',
    maxPlayers: 10,
    currentPlayers: 1,
    organizerId: 'user-1',
    status: 'open',
    participantIds: ['user-1'],
    createdAt: '2026-05-10T20:00:00.000Z',
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsServiceController],
      providers: [NotificationsServiceService],
    }).compile();

    notificationsServiceController = app.get<NotificationsServiceController>(
      NotificationsServiceController,
    );
    notificationsServiceService = app.get<NotificationsServiceService>(
      NotificationsServiceService,
    );
  });

  describe('root', () => {
    it('should create a notification from a match event', () => {
      notificationsServiceController.handleMatchCreated(match);

      expect(notificationsServiceService.findAll()).toHaveLength(1);
    });

    it('should create notifications from all match events', () => {
      notificationsServiceController.handleMatchCreated(match);
      notificationsServiceController.handleMatchUpdated(match);
      notificationsServiceController.handleMatchDeleted(match);
      notificationsServiceController.handleMatchCancelled({
        ...match,
        status: 'cancelled',
      });
      notificationsServiceController.handleMatchResultUpdated({
        ...match,
        status: 'completed',
        globalScoreA: 2,
        globalScoreB: 1,
      });

      expect(notificationsServiceService.findAll()).toHaveLength(5);
    });
  });
});
