import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { MATCHES_EVENTS, TOURNAMENTS_PATTERNS } from '@app/contracts';
import type {
  CreateTournamentDto,
  GenerateFixtureDto,
  MatchResultUpdatedEvent,
  RegisterTeamDto,
  ReportFixtureResultDto,
  TournamentDto,
} from '@app/contracts';
import { TournamentsServiceService } from './tournaments-service.service';

@Controller()
export class TournamentsServiceController {
  constructor(
    private readonly tournamentsServiceService: TournamentsServiceService,
  ) {}

  @MessagePattern(TOURNAMENTS_PATTERNS.FIND_ALL)
  findAll(): TournamentDto[] {
    return this.tournamentsServiceService.findAll();
  }

  @MessagePattern(TOURNAMENTS_PATTERNS.CREATE)
  create(createTournamentDto: CreateTournamentDto): TournamentDto {
    return this.tournamentsServiceService.create(createTournamentDto);
  }

  @MessagePattern(TOURNAMENTS_PATTERNS.FIND_BY_ID)
  findById(id: string): TournamentDto | undefined {
    return this.tournamentsServiceService.findById(id);
  }

  @MessagePattern(TOURNAMENTS_PATTERNS.REGISTER_TEAM)
  registerTeam(registerTeamDto: RegisterTeamDto): TournamentDto {
    return this.tournamentsServiceService.registerTeam(registerTeamDto);
  }

  @MessagePattern(TOURNAMENTS_PATTERNS.GENERATE_FIXTURE)
  generateFixture(generateFixtureDto: GenerateFixtureDto): TournamentDto {
    return this.tournamentsServiceService.generateFixture(generateFixtureDto);
  }

  @MessagePattern(TOURNAMENTS_PATTERNS.REPORT_FIXTURE_RESULT)
  reportFixtureResult(
    reportFixtureResultDto: ReportFixtureResultDto,
  ): TournamentDto {
    return this.tournamentsServiceService.reportFixtureResult(
      reportFixtureResultDto,
    );
  }

  @EventPattern(MATCHES_EVENTS.RESULT_UPDATED)
  handleMatchResultUpdated(event: MatchResultUpdatedEvent): void {
    this.tournamentsServiceService.handleMatchResultUpdated(event);
  }
}
