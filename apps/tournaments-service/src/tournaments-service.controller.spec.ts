import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsServiceController } from './tournaments-service.controller';
import { TournamentsServiceService } from './tournaments-service.service';

describe('TournamentsServiceController', () => {
  let tournamentsServiceController: TournamentsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TournamentsServiceController],
      providers: [TournamentsServiceService],
    }).compile();

    tournamentsServiceController = app.get<TournamentsServiceController>(
      TournamentsServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(tournamentsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
