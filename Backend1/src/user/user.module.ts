import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, TaskCollectionService],
  exports:[UserService],// export userService do auth 
})
export class UserModule {}
