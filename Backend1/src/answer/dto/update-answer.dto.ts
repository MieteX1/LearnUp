import { PartialType } from '@nestjs/mapped-types';
import { CreateAnswerDto } from './create-answer.dto';
import { Answer_type } from '../answer.type';

export class UpdateAnswerDto extends PartialType(CreateAnswerDto) {
    type:           Answer_type
    option_id?:       number
    answer?:        string
}
