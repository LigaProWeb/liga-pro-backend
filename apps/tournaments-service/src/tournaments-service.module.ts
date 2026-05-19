import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { TournamentsServiceController } from './tournaments-service.controller';
import { TournamentsServiceService } from './tournaments-service.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NOTIFICATIONS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [TournamentsServiceController],
  providers: [TournamentsServiceService],
})
export class TournamentsServiceModule {}
