import { Test, TestingModule } from '@nestjs/testing';
import { MatchDto } from '@app/contracts';
import { NotificationsServiceController } from './notifications-service.controller';
import { NotificationsServiceService } from './notifications-service.service';

describe('NotificationsServiceController', () => {
  let notificationsServiceController: NotificationsServiceController;
  let notificationsServiceService: NotificationsServiceService;

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
      const match: MatchDto = {
        id: 'match-1',
        sport: 'football',
        title: 'Futbol 5',
        location: 'Mendoza',
        date: '2026-05-12T20:00:00.000Z',
        maxPlayers: 10,
        currentPlayers: 1,
        organizerId: 'user-1',
        status: 'open',
      };

      notificationsServiceController.handleMatchCreated(match);

      expect(notificationsServiceService.findAll()).toHaveLength(1);
    });
  });
});
