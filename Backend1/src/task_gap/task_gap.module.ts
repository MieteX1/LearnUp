import { Module } from '@nestjs/common';
import { TaskGapService } from './task_gap.service';
import { TaskGapController } from './task_gap.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionModule } from 'src/task_collection/task_collection.module';

@Module({
  imports: [TaskCollectionModule],
  controllers: [TaskGapController],
  providers: [TaskGapService, PrismaService],
})
export class TaskGapModule {}
