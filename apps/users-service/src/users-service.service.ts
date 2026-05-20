import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import type {
  AuthResponseDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateProfileDto,
  UpsertSportPreferenceDto,
  UserDto,
  UserProfileDto,
  UserSportPreferenceDto,
} from '@app/contracts';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserSportPrefEntity } from './entities/user-sport-pref.entity';

@Injectable()
export class UsersServiceService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly profilesRepository: Repository<UserProfileEntity>,
    @InjectRepository(UserSportPrefEntity)
    private readonly sportPrefsRepository: Repository<UserSportPrefEntity>,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<UserDto> {
    const existingUser = await this.usersRepository.findOneBy({
      email: registerUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email: registerUserDto.email,
        passwordHash: this.hashPassword(registerUserDto.password),
        globalRole: registerUserDto.globalRole,
      }),
    );

    await this.profilesRepository.save(
      this.profilesRepository.create({
        userId: user.id,
        firstName: registerUserDto.firstName,
        isPublic: registerUserDto.isPublic ?? true,
      }),
    );

    return this.toDto(user);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOneBy({
      email: loginUserDto.email,
    });

    if (
      !user ||
      user.passwordHash !== this.hashPassword(loginUserDto.password)
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.createAccessToken(user),
      user: await this.toDto(user),
    };
  }

  async findById(id: string): Promise<UserDto | undefined> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return undefined;
    }

    return this.toDto(user);
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<UserDto> {
    const user = await this.usersRepository.findOneBy({
      id: updateProfileDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email) {
      user.email = updateProfileDto.email;
      await this.usersRepository.save(user);
    }

    const profile = await this.profilesRepository.findOneBy({
      userId: updateProfileDto.userId,
    });

    const updatedProfile = this.profilesRepository.create({
      userId: updateProfileDto.userId,
      firstName: updateProfileDto.firstName ?? profile?.firstName ?? '',
      isPublic: updateProfileDto.isPublic ?? profile?.isPublic ?? true,
    });

    await this.profilesRepository.save(updatedProfile);

    return this.toDto(user);
  }

  async upsertSportPreference(
    upsertSportPreferenceDto: UpsertSportPreferenceDto,
  ): Promise<UserSportPreferenceDto> {
    const user = await this.usersRepository.findOneBy({
      id: upsertSportPreferenceDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sportPreference = await this.sportPrefsRepository.save(
      this.sportPrefsRepository.create({
        userId: upsertSportPreferenceDto.userId,
        sportId: upsertSportPreferenceDto.sportId,
        skillLevel: upsertSportPreferenceDto.skillLevel,
      }),
    );

    return this.toSportPreferenceDto(sportPreference);
  }

  async findSportPreferences(
    userId: string,
  ): Promise<UserSportPreferenceDto[]> {
    const preferences = await this.sportPrefsRepository.findBy({ userId });

    return preferences.map((preference) =>
      this.toSportPreferenceDto(preference),
    );
  }

  private async toDto(user: UserEntity): Promise<UserDto> {
    const [profile, sportPreferences] = await Promise.all([
      this.profilesRepository.findOneBy({ userId: user.id }),
      this.sportPrefsRepository.findBy({ userId: user.id }),
    ]);

    return {
      id: user.id,
      email: user.email,
      globalRole: user.globalRole,
      profile: profile ? this.toProfileDto(profile) : undefined,
      sportPreferences: sportPreferences.map((preference) =>
        this.toSportPreferenceDto(preference),
      ),
    };
  }

  private toProfileDto(profile: UserProfileEntity): UserProfileDto {
    return {
      userId: profile.userId,
      firstName: profile.firstName,
      isPublic: profile.isPublic,
    };
  }

  private toSportPreferenceDto(
    sportPreference: UserSportPrefEntity,
  ): UserSportPreferenceDto {
    return {
      userId: sportPreference.userId,
      sportId: sportPreference.sportId,
      skillLevel: sportPreference.skillLevel,
    };
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  private createAccessToken(user: UserEntity): string {
    const payload = JSON.stringify({
      sub: user.id,
      role: user.globalRole,
      nonce: randomBytes(8).toString('hex'),
    });

    return Buffer.from(payload).toString('base64url');
  }
}
