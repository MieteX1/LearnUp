import { Module } from '@nestjs/common';
import { CollectionComplaintService } from './collection_complaint.service';
import { CollectionComplaintController } from './collection_complaint.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CollectionComplaintController],
  providers: [CollectionComplaintService, PrismaService],
})
export class CollectionComplaintModule {}
