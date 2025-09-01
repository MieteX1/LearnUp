import { Module } from '@nestjs/common';
import { TaskMatchService } from './task_match.service';
import { TaskMatchController } from './task_match.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionModule } from 'src/task_collection/task_collection.module';

@Module({
  imports: [TaskCollectionModule],
  controllers: [TaskMatchController],
  providers: [TaskMatchService, PrismaService],
})
export class TaskMatchModule {}
