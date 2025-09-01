import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskGapDto } from './create-task_gap.dto';
import { Difficulty } from '@prisma/client';

export class UpdateTaskGapDto extends PartialType(CreateTaskGapDto) {
    description:    string
    name:           string
    text:           string
    difficulty:     Difficulty
    category:       string
    order_:        number
}
