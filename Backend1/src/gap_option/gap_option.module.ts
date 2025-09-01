import { Module } from '@nestjs/common';
import { GapOptionService } from './gap_option.service';
import { GapOptionController } from './gap_option.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [GapOptionController],
  providers: [GapOptionService, PrismaService],
})
export class GapOptionModule {}
