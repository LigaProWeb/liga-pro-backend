export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: UserDto;
}

export interface UpdateProfileDto {
  email?: string;
  name?: string;
}
