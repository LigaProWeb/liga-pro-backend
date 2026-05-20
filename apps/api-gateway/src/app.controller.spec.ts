import { Test, TestingModule } from '@nestjs/testing';
import {
  MATCHES_SERVICE,
  TOURNAMENTS_SERVICE,
  USERS_SERVICE,
} from '@app/contracts';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: MATCHES_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: TOURNAMENTS_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: USERS_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the gateway name', () => {
      expect(appController.getHello()).toBe('Liga Pro API Gateway');
    });
  });
});
