import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserSportPrefEntity } from './entities/user-sport-pref.entity';

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
        schema: 'users_svc',
        entities: [UserEntity, UserProfileEntity, UserSportPrefEntity],
        synchronize: false,
        retryAttempts: 0,
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      UserSportPrefEntity,
    ]),
  ],
  controllers: [UsersServiceController],
  providers: [UsersServiceService],
})
export class UsersServiceModule {}
