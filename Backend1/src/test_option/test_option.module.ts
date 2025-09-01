import { Module } from '@nestjs/common';
import { TestOptionService } from './test_option.service';
import { TestOptionController } from './test_option.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionModule } from 'src/task_collection/task_collection.module';

@Module({
  imports: [TaskCollectionModule],
  controllers: [TestOptionController],
  providers: [TestOptionService, PrismaService],
})
export class TestOptionModule {}
