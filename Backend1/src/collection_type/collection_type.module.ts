import { Module } from '@nestjs/common';
import { CollectionTypeService } from './collection_type.service';
import { CollectionTypeController } from './collection_type.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CollectionTypeController],
  providers: [CollectionTypeService, PrismaService],
})
export class CollectionTypeModule {}