import { Test, TestingModule } from '@nestjs/testing';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { of } from 'rxjs';
import { TournamentsServiceController } from './tournaments-service.controller';
import { TournamentsServiceService } from './tournaments-service.service';

describe('TournamentsServiceController', () => {
  let tournamentsServiceController: TournamentsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TournamentsServiceController],
      providers: [
        TournamentsServiceService,
        {
          provide: NOTIFICATIONS_SERVICE,
          useValue: {
            emit: jest.fn(() => of(true)),
          },
        },
      ],
    }).compile();

    tournamentsServiceController = app.get<TournamentsServiceController>(
      TournamentsServiceController,
    );
  });

  describe('root', () => {
    it('should start with no tournaments', () => {
      expect(tournamentsServiceController.findAll()).toEqual([]);
    });
  });
});
