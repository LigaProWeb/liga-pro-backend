import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TOURNAMENTS_PATTERNS } from '@app/contracts';
import type { CreateTournamentDto, TournamentDto } from '@app/contracts';
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
}
