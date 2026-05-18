import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { 
  RegisterUserDto, 
  UserDto, 
  LoginUserDto, 
  AuthResponseDto, 
  UpdateProfileDto 
} from '@app/contracts';
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


  loginUser(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { email, password } = loginUserDto;

    // Simulamos una validación fallida para que puedas probar errores en el Frontend
    if (email === 'error@prueba.com') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Simulamos un login exitoso
    return Promise.resolve({
      access_token: 'mock-jwt-token-xyz-12345',
      user: {
        id: randomUUID(), // En la realidad, esto vendría de la BD
        email: email,
        name: 'Usuario Logueado',
      }
    });
  }

  updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserDto> {
    // Simulamos que encontramos al usuario y pisamos sus datos con los nuevos
    return Promise.resolve({
      id: id,
      // Si mandaron un email nuevo, lo usamos; si no, dejamos uno genérico
      email: updateProfileDto.email || 'email-existente@test.com',
      name: updateProfileDto.name || 'Nombre Existente',
    });
  }
}