import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import type {
  AuthResponseDto,
  CreateMatchDto,
  CreateTournamentDto,
  JoinMatchDto,
  LeaveMatchDto,
  LoginUserDto,
  RegisterTeamDto,
  RegisterUserDto,
  ReportFixtureResultDto,
  MatchDto,
  TournamentDto,
  UpdateMatchDto,
  UpdateResultDto,
  UpdateProfileDto,
  UpsertSportPreferenceDto,
  UserDto,
  UserSportPreferenceDto,
} from '@app/contracts';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('matches')
  createMatch(@Body() createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return this.appService.createMatch(createMatchDto);
  }

  @Get('matches')
  findMatches(): Promise<MatchDto[]> {
    return this.appService.findMatches();
  }

  @Get('matches/:id')
  findMatchById(@Param('id') id: string): Promise<MatchDto | undefined> {
    return this.appService.findMatchById(id);
  }

  @Put('matches/:id')
  updateMatch(
    @Param('id') id: string,
    @Body() updateMatchDto: Omit<UpdateMatchDto, 'id'>,
  ): Promise<MatchDto> {
    return this.appService.updateMatch({
      id,
      ...updateMatchDto,
    });
  }

  @Delete('matches/:id')
  deleteMatch(@Param('id') id: string): Promise<void> {
    return this.appService.deleteMatch(id);
  }

  @Post('matches/:id/cancel')
  cancelMatch(@Param('id') id: string): Promise<MatchDto> {
    return this.appService.cancelMatch(id);
  }

  @Post('matches/:id/join')
  joinMatch(
    @Param('id') matchId: string,
    @Body() joinMatchDto: Omit<JoinMatchDto, 'matchId'>,
  ): Promise<MatchDto> {
    return this.appService.joinMatch({
      matchId,
      ...joinMatchDto,
    });
  }

  @Post('matches/:id/leave')
  leaveMatch(
    @Param('id') matchId: string,
    @Body() leaveMatchDto: Omit<LeaveMatchDto, 'matchId'>,
  ): Promise<MatchDto> {
    return this.appService.leaveMatch({
      matchId,
      ...leaveMatchDto,
    });
  }

  @Put('matches/:id/result')
  updateMatchResult(
    @Param('id') id: string,
    @Body() updateResultDto: Omit<UpdateResultDto, 'id'>,
  ): Promise<MatchDto> {
    return this.appService.updateMatchResult({
      id,
      ...updateResultDto,
    });
  }

  @Post('tournaments')
  createTournament(
    @Body() createTournamentDto: CreateTournamentDto,
  ): Promise<TournamentDto> {
    return this.appService.createTournament(createTournamentDto);
  }

  @Get('tournaments')
  findTournaments(): Promise<TournamentDto[]> {
    return this.appService.findTournaments();
  }

  @Get('tournaments/:id')
  findTournamentById(
    @Param('id') id: string,
  ): Promise<TournamentDto | undefined> {
    return this.appService.findTournamentById(id);
  }

  @Post('tournaments/:id/teams')
  registerTournamentTeam(
    @Param('id') tournamentId: string,
    @Body() registerTeamDto: Omit<RegisterTeamDto, 'tournamentId'>,
  ): Promise<TournamentDto> {
    return this.appService.registerTournamentTeam({
      tournamentId,
      ...registerTeamDto,
    });
  }

  @Post('tournaments/:id/fixture')
  generateTournamentFixture(
    @Param('id') tournamentId: string,
  ): Promise<TournamentDto> {
    return this.appService.generateTournamentFixture({ tournamentId });
  }

  @Post('tournaments/:id/fixtures/:fixtureId/result')
  reportTournamentFixtureResult(
    @Param('id') tournamentId: string,
    @Param('fixtureId') fixtureId: string,
    @Body()
    resultDto: Omit<ReportFixtureResultDto, 'tournamentId' | 'fixtureId'>,
  ): Promise<TournamentDto> {
    return this.appService.reportTournamentFixtureResult({
      tournamentId,
      fixtureId,
      ...resultDto,
    });
  }

  @Post('users/register')
  registerUser(@Body() registerUserDto: RegisterUserDto): Promise<UserDto> {
    return this.appService.registerUser(registerUserDto);
  }

  @Post('users/login')
  loginUser(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.appService.loginUser(loginUserDto);
  }

  @Get('users/:id')
  findUserById(@Param('id') id: string): Promise<UserDto | undefined> {
    return this.appService.findUserById(id);
  }

  @Put('users/:id/profile')
  updateUserProfile(
    @Param('id') userId: string,
    @Body() updateProfileDto: Omit<UpdateProfileDto, 'userId'>,
  ): Promise<UserDto> {
    return this.appService.updateUserProfile({
      userId,
      ...updateProfileDto,
    });
  }

  @Put('users/:id/sports/:sportId/preference')
  upsertUserSportPreference(
    @Param('id') userId: string,
    @Param('sportId') sportId: string,
    @Body()
    upsertSportPreferenceDto: Omit<
      UpsertSportPreferenceDto,
      'userId' | 'sportId'
    >,
  ): Promise<UserSportPreferenceDto> {
    return this.appService.upsertUserSportPreference({
      userId,
      sportId: Number(sportId),
      ...upsertSportPreferenceDto,
    });
  }

  @Get('users/:id/sports/preferences')
  findUserSportPreferences(
    @Param('id') userId: string,
  ): Promise<UserSportPreferenceDto[]> {
    return this.appService.findUserSportPreferences(userId);
  }
}