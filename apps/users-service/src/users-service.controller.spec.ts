import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceService } from './users-service.service';
import { UsersServiceController } from './users-service.controller';

describe('UsersServiceController', () => {
  let usersServiceController: UsersServiceController;
  const usersServiceMock = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    findById: jest.fn(),
    updateProfile: jest.fn(),
    upsertSportPreference: jest.fn(),
    findSportPreferences: jest.fn(),
  } satisfies Partial<Record<keyof UsersServiceService, jest.Mock>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersServiceController],
      providers: [
        {
          provide: UsersServiceService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    usersServiceController = app.get<UsersServiceController>(
      UsersServiceController,
    );
  });

  it('delegates user registration to the service', async () => {
    usersServiceMock.registerUser.mockResolvedValue({
      id: 'user-1',
      email: 'joaco@test.com',
      globalRole: 'player',
    });

    await expect(
      usersServiceController.registerUser({
        email: 'joaco@test.com',
        password: '123456',
        firstName: 'Joaco',
        globalRole: 'player',
      }),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'joaco@test.com',
      globalRole: 'player',
    });
  });
});
