import { Body, Controller, Get, Param, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import type { 
  RegisterUserDto, 
  UserDto, 
  LoginUserDto, 
  AuthResponseDto, 
  UpdateProfileDto 
} from '@app/contracts';
import { UsersServiceService } from './users-service.service';

@Controller('users')
export class UsersServiceController {
  constructor(private readonly usersServiceService: UsersServiceService) {}

  @Get()
  getHello(): string {
    return this.usersServiceService.getHello();
  }

  // Obliga a que el Frontend envíe sí o sí un nombre, un correo y un rol para poder crear una cuenta.
  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto): Promise<UserDto> {
    return this.usersServiceService.registerUser(registerUserDto);
  }

  
  // Define que para iniciar sesión se necesitará exclusivamente un email y un password.
  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambiamos el 201 por defecto de POST a un 200 OK
  loginUser(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.usersServiceService.loginUser(loginUserDto);
  }

  // Tiene campos opcionales como name o email, ya que un usuario de la liga podría querer actualizar su nombre sin tocar su correo.
  @Put('profile/:id')
  updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<UserDto> {
    return this.usersServiceService.updateProfile(id, updateProfileDto);
  }
}
