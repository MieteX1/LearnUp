import { Module } from '@nestjs/common';
import { CommentComplaintService } from './comment_complaint.service';
import { CommentComplaintController } from './comment_complaint.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CommentComplaintController],
  providers: [CommentComplaintService, PrismaService],
})
export class CommentComplaintModule {}
