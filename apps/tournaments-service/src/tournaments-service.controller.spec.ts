import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsServiceController } from './tournaments-service.controller';
import { TournamentsServiceService } from './tournaments-service.service';

describe('TournamentsServiceController', () => {
  let tournamentsServiceController: TournamentsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TournamentsServiceController],
      providers: [
        {
          provide: TournamentsServiceService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    tournamentsServiceController = app.get<TournamentsServiceController>(
      TournamentsServiceController,
    );
  });

  describe('root', () => {
    it('should start with no tournaments', async () => {
      await expect(tournamentsServiceController.findAll()).resolves.toEqual([]);
    });
  });
});
