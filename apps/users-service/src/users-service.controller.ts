import { Body, Controller, Get, Post } from '@nestjs/common';
import type { RegisterUserDto, UserDto } from '@app/contracts';
import { UsersServiceService } from './users-service.service';

@Controller()
export class UsersServiceController {
  constructor(private readonly usersServiceService: UsersServiceService) {}

  @Get()
  getHello(): string {
    return this.usersServiceService.getHello();
  }

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto): Promise<UserDto> {
    return this.usersServiceService.registerUser(registerUserDto);
  }

  //@Post('users')

  //@Get('users')
}
