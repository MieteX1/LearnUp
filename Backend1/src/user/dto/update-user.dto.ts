import { PartialType } from '@nestjs/mapped-types';
import { Role } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    login?: string;
    email?: string;
    role?: Role;
    avatar_id?: number; 

}
