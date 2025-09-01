import { PartialType } from '@nestjs/mapped-types';
import { CreateUserComplaintDto } from './create-user_complaint.dto';

export class UpdateUserComplaintDto extends PartialType(CreateUserComplaintDto) {}
