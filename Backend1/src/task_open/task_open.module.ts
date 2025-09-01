import { Module } from '@nestjs/common';
import { TaskOpenService } from './task_open.service';
import { TaskOpenController } from './task_open.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionModule } from 'src/task_collection/task_collection.module';

@Module({
  imports: [TaskCollectionModule],
  controllers: [TaskOpenController],
  providers: [TaskOpenService, PrismaService],
})
export class TaskOpenModule {}
