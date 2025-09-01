import { Module } from '@nestjs/common';
import { MatchOptionService } from './match_option.service';
import { MatchOptionController } from './match_option.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MatchOptionController],
  providers: [MatchOptionService, PrismaService],
})
export class MatchOptionModule {}
