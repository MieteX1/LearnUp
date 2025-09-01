import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectionTypeDto } from './create-collection_type.dto';

export class UpdateCollectionTypeDto extends PartialType(CreateCollectionTypeDto) {
    name: string
}