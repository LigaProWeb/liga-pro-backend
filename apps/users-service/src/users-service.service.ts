import { Injectable } from '@nestjs/common';
import type { RegisterUserDto, UserDto } from '@app/contracts';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UsersServiceService {
  getHello(): string {
    return 'Hello World!';
  }

  registerUser(registerUserDto: RegisterUserDto): Promise<UserDto> {
    const { email, name } = registerUserDto;
    return Promise.resolve({
      id: randomUUID(),
      email,
      name,
    });
  }
}
