import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskOpenDto } from './create-task_open.dto';
import { Difficulty } from '@prisma/client';

export class UpdateTaskOpenDto extends PartialType(CreateTaskOpenDto) 
{
    name:           string
    description:    string
    difficulty:     Difficulty
    category:       string
    order_:        number
}
