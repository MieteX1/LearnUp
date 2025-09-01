import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchOptionDto } from './create-match_option.dto';

export class UpdateMatchOptionDto extends PartialType(CreateMatchOptionDto) {
    title:      string
    answer:     string
}
