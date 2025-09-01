import { Module } from '@nestjs/common';
import { TaskTestService } from './task_test.service';
import { TaskTestController } from './task_test.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionModule } from 'src/task_collection/task_collection.module';

@Module({
  imports: [TaskCollectionModule],
  controllers: [TaskTestController],
  providers: [TaskTestService, PrismaService],
})
export class TaskTestModule {}
