import { PartialType } from '@nestjs/mapped-types';
import { CreateGapOptionDto } from './create-gap_option.dto';

export class UpdateGapOptionDto extends PartialType(CreateGapOptionDto) {
    answer:  string
    position:number
}
