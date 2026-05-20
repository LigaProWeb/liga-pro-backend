import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MATCHES_PATTERNS,
  MATCHES_SERVICE,
  TOURNAMENTS_PATTERNS,
  TOURNAMENTS_SERVICE,
  USERS_PATTERNS,
  USERS_SERVICE,
} from '@app/contracts';
import type {
  AuthResponseDto,
  CreateMatchDto,
  CreateTournamentDto,
  GenerateFixtureDto,
  LoginUserDto,
  MatchDto,
  RegisterTeamDto,
  RegisterUserDto,
  ReportFixtureResultDto,
  TournamentDto,
  UpdateProfileDto,
  UpsertSportPreferenceDto,
  UserDto,
  UserSportPreferenceDto,
} from '@app/contracts';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject(MATCHES_SERVICE)
    private readonly matchesClient: ClientProxy,
    @Inject(TOURNAMENTS_SERVICE)
    private readonly tournamentsClient: ClientProxy,
    @Inject(USERS_SERVICE)
    private readonly usersClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Liga Pro API Gateway';
  }

  createMatch(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return firstValueFrom(
      this.matchesClient.send<MatchDto>(
        MATCHES_PATTERNS.CREATE,
        createMatchDto,
      ),
    );
  }

  findMatches(): Promise<MatchDto[]> {
    return firstValueFrom(
      this.matchesClient.send<MatchDto[]>(MATCHES_PATTERNS.FIND_ALL, {}),
    );
  }

  createTournament(
    createTournamentDto: CreateTournamentDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.CREATE,
        createTournamentDto,
      ),
    );
  }

  findTournaments(): Promise<TournamentDto[]> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto[]>(
        TOURNAMENTS_PATTERNS.FIND_ALL,
        {},
      ),
    );
  }

  findTournamentById(id: string): Promise<TournamentDto | undefined> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto | undefined>(
        TOURNAMENTS_PATTERNS.FIND_BY_ID,
        id,
      ),
    );
  }

  registerTournamentTeam(
    registerTeamDto: RegisterTeamDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.REGISTER_TEAM,
        registerTeamDto,
      ),
    );
  }

  generateTournamentFixture(
    generateFixtureDto: GenerateFixtureDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.GENERATE_FIXTURE,
        generateFixtureDto,
      ),
    );
  }

  reportTournamentFixtureResult(
    reportFixtureResultDto: ReportFixtureResultDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.tournamentsClient.send<TournamentDto>(
        TOURNAMENTS_PATTERNS.REPORT_FIXTURE_RESULT,
        reportFixtureResultDto,
      ),
    );
  }

  registerUser(registerUserDto: RegisterUserDto): Promise<UserDto> {
    return firstValueFrom(
      this.usersClient.send<UserDto>(USERS_PATTERNS.REGISTER, registerUserDto),
    );
  }

  loginUser(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return firstValueFrom(
      this.usersClient.send<AuthResponseDto>(
        USERS_PATTERNS.LOGIN,
        loginUserDto,
      ),
    );
  }

  findUserById(id: string): Promise<UserDto | undefined> {
    return firstValueFrom(
      this.usersClient.send<UserDto | undefined>(USERS_PATTERNS.FIND_BY_ID, id),
    );
  }

  updateUserProfile(updateProfileDto: UpdateProfileDto): Promise<UserDto> {
    return firstValueFrom(
      this.usersClient.send<UserDto>(
        USERS_PATTERNS.UPDATE_PROFILE,
        updateProfileDto,
      ),
    );
  }

  upsertUserSportPreference(
    upsertSportPreferenceDto: UpsertSportPreferenceDto,
  ): Promise<UserSportPreferenceDto> {
    return firstValueFrom(
      this.usersClient.send<UserSportPreferenceDto>(
        USERS_PATTERNS.UPSERT_SPORT_PREFERENCE,
        upsertSportPreferenceDto,
      ),
    );
  }

  findUserSportPreferences(userId: string): Promise<UserSportPreferenceDto[]> {
    return firstValueFrom(
      this.usersClient.send<UserSportPreferenceDto[]>(
        USERS_PATTERNS.FIND_SPORT_PREFERENCES,
        userId,
      ),
    );
  }
}
