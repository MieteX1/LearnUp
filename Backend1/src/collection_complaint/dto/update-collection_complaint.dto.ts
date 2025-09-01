import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectionComplaintDto } from './create-collection_complaint.dto';

export class UpdateCollectionComplaintDto extends PartialType(CreateCollectionComplaintDto) {}
