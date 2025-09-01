import { Role } from '@prisma/client';
import { IsString } from 'class-validator';

export class UserDto {
  @IsString()
  name: string;
  @IsString()
  login: string;
  @IsString()
  email: string;
  @IsString()
  refresh_token?: string;

  role: Role;
}