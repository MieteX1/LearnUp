import { Module } from '@nestjs/common';
import { TaskCollectionService } from './task_collection.service';
import { TaskCollectionController } from './task_collection.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TaskCollectionController],
  providers: [TaskCollectionService, PrismaService],
  exports: [TaskCollectionService],
})
export class TaskCollectionModule {}
