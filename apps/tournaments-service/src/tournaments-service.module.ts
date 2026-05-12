import { Module } from '@nestjs/common';
import { TournamentsServiceController } from './tournaments-service.controller';
import { TournamentsServiceService } from './tournaments-service.service';

@Module({
  imports: [],
  controllers: [TournamentsServiceController],
  providers: [TournamentsServiceService],
})
export class TournamentsServiceModule {}
