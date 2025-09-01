import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {
    name:           string
    description:    string
    side1:          string
    side2:          string
    category:       string
    order?:         number
}
