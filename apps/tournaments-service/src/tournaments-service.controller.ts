import { Controller, Get } from '@nestjs/common';
import { TournamentsServiceService } from './tournaments-service.service';

@Controller()
export class TournamentsServiceController {
  constructor(
    private readonly tournamentsServiceService: TournamentsServiceService,
  ) {}

  @Get()
  getHello(): string {
    return this.tournamentsServiceService.getHello();
  }
}
