import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type {
  CreateMatchDto,
  CreateTournamentDto,
  RegisterTeamDto,
  ReportFixtureResultDto,
  MatchDto,
  TournamentDto,
} from '@app/contracts';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('matches')
  createMatch(@Body() createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return this.appService.createMatch(createMatchDto);
  }

  @Get('matches')
  findMatches(): Promise<MatchDto[]> {
    return this.appService.findMatches();
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
}
