import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentComplaintDto } from './create-comment_complaint.dto';

export class UpdateCommentComplaintDto extends PartialType(CreateCommentComplaintDto) {}
