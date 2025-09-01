import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskMatchDto } from './create-task_match.dto';
import { Difficulty } from '@prisma/client';

export class UpdateTaskMatchDto extends PartialType(CreateTaskMatchDto) {
    description:    string
    name:           string
    difficulty:     Difficulty
    category:       string
    order_:        number
}
