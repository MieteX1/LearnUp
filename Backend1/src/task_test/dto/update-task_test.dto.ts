import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskTestDto } from './create-task_test.dto';
import { Difficulty } from '@prisma/client';

export class UpdateTaskTestDto extends PartialType(CreateTaskTestDto) {
    name:           string
    description:    string
    difficulty:     Difficulty
    category:       string
    order_:        number
}
