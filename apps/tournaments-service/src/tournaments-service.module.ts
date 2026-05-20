import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NOTIFICATIONS_SERVICE } from '@app/contracts';
import { TournamentsServiceController } from './tournaments-service.controller';
import { TournamentsServiceService } from './tournaments-service.service';
import { FixtureAuditEntity } from './entities/fixture-audit.entity';
import { FixtureSetEntity } from './entities/fixture-set.entity';
import { FixtureEntity } from './entities/fixture.entity';
import { PhaseEntity } from './entities/phase.entity';
import { TeamMemberEntity } from './entities/team-member.entity';
import { TeamEntity } from './entities/team.entity';
import { TournamentRegistrationEntity } from './entities/tournament-registration.entity';
import { TournamentEntity } from './entities/tournament.entity';

const tournamentEntities = [
  TournamentEntity,
  PhaseEntity,
  TeamEntity,
  TeamMemberEntity,
  TournamentRegistrationEntity,
  FixtureEntity,
  FixtureSetEntity,
  FixtureAuditEntity,
];

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
        schema: 'tournaments_svc',
        entities: tournamentEntities,
        synchronize: false,
        retryAttempts: 0,
      }),
    }),
    TypeOrmModule.forFeature(tournamentEntities),
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
