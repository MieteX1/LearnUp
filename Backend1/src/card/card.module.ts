import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionModule } from 'src/task_collection/task_collection.module';

@Module({
  imports: [TaskCollectionModule],
  controllers: [CardController],
  providers: [CardService, PrismaService],
})
export class CardModule {}
