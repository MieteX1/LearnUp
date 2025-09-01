import { Module } from '@nestjs/common';
import { UserComplaintService } from './user_complaint.service';
import { UserComplaintController } from './user_complaint.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UserComplaintController],
  providers: [UserComplaintService, PrismaService],
})
export class UserComplaintModule {}
