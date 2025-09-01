import { PartialType } from '@nestjs/mapped-types';
import { CreateTestOptionDto } from './create-test_option.dto';

export class UpdateTestOptionDto extends PartialType(CreateTestOptionDto) {
    title:      string
    is_answer:  boolean
}
