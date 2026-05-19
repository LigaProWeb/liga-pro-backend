import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { MatchesServiceController } from './matches-service.controller';
import { MatchesServiceService } from './matches-service.service';
import { MatchEntity } from './entities/match.entity';
import { MatchParticipantEntity } from './entities/match-participant.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: Number(configService.get<string>('POSTGRES_PORT', '5432')),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get<string>('POSTGRES_DB', 'liga_pro'),
        schema: 'matches_svc',
        entities: [MatchEntity, MatchParticipantEntity],
        synchronize: false,
        retryAttempts: 0,
      }),
    }),
    TypeOrmModule.forFeature([MatchEntity, MatchParticipantEntity]),
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
