import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { USERS_PATTERNS } from '@app/contracts';
import type {
  AuthResponseDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateProfileDto,
  UpsertSportPreferenceDto,
  UserDto,
  UserSportPreferenceDto,
} from '@app/contracts';
import { UsersServiceService } from './users-service.service';

@Controller()
export class UsersServiceController {
  constructor(private readonly usersServiceService: UsersServiceService) {}

  @MessagePattern(USERS_PATTERNS.REGISTER)
  registerUser(registerUserDto: RegisterUserDto): Promise<UserDto> {
    return this.usersServiceService.registerUser(registerUserDto);
  }

  @MessagePattern(USERS_PATTERNS.LOGIN)
  loginUser(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.usersServiceService.loginUser(loginUserDto);
  }

  @MessagePattern(USERS_PATTERNS.FIND_BY_ID)
  findById(id: string): Promise<UserDto | undefined> {
    return this.usersServiceService.findById(id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_PROFILE)
  updateProfile(updateProfileDto: UpdateProfileDto): Promise<UserDto> {
    return this.usersServiceService.updateProfile(updateProfileDto);
  }

  @MessagePattern(USERS_PATTERNS.UPSERT_SPORT_PREFERENCE)
  upsertSportPreference(
    upsertSportPreferenceDto: UpsertSportPreferenceDto,
  ): Promise<UserSportPreferenceDto> {
    return this.usersServiceService.upsertSportPreference(
      upsertSportPreferenceDto,
    );
  }

  @MessagePattern(USERS_PATTERNS.FIND_SPORT_PREFERENCES)
  findSportPreferences(userId: string): Promise<UserSportPreferenceDto[]> {
    return this.usersServiceService.findSportPreferences(userId);
  }
}
