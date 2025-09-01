import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Module({
  providers: [UploadsService,PrismaService,UserService,TaskCollectionService],
  controllers: [UploadsController]
})
export class UploadsModule {}
