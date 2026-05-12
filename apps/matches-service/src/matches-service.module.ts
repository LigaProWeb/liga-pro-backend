import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { MatchesServiceController } from './matches-service.controller';
import { MatchesServiceService } from './matches-service.service';

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
  controllers: [MatchesServiceController],
  providers: [MatchesServiceService],
})
export class MatchesServiceModule {}
