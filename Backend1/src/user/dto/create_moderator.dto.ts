import { Role } from '@prisma/client';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class createModeratorDTO {
  // @IsString()
  // name: string;
  @IsOptional()
  @IsString()
  //@MinLength(8,{message: 'Password must be at least 8 characters long'}) // później odkomentować żeby sprawdzać długość hasła i ustawić jeszcze walitatory np że w haśle musi być wielka litera
  //@Matches(/^(?=.*[0-9])/,({message:'Password must contain at least one number'}))
  password: string;
  @IsEmail()// było @Isstring
  email: string;
  role : Role;
}