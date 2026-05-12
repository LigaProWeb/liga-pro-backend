import { Test, TestingModule } from '@nestjs/testing';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { of } from 'rxjs';
import { MatchesServiceController } from './matches-service.controller';
import { MatchesServiceService } from './matches-service.service';

describe('MatchesServiceController', () => {
  let matchesServiceController: MatchesServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MatchesServiceController],
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

    matchesServiceController = app.get<MatchesServiceController>(
      MatchesServiceController,
    );
  });

  describe('root', () => {
    it('should start with no matches', () => {
      expect(matchesServiceController.findAll()).toEqual([]);
    });
  });
});
