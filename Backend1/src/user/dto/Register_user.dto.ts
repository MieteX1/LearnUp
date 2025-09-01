import { Role } from '@prisma/client';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message: 'Password must contain at least one number, one uppercase, one lowercase letter, and be at least 8 characters long',
  })
  password: string;
  @IsEmail()// było @Isstring
  email: string;
  role : Role;
}