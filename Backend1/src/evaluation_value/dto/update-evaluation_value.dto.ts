import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationValueDto } from './create-evaluation_value.dto';

export class UpdateEvaluationValueDto extends PartialType(CreateEvaluationValueDto) {
    is_positive:    boolean
}
