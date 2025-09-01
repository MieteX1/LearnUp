import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { PrismaService } from 'src/prisma.service';
import { EvaluationValueService } from 'src/evaluation_value/evaluation_value.service';

@Module({
  controllers: [EvaluationController],
  providers: [EvaluationService, EvaluationValueService, PrismaService],
})
export class EvaluationModule {}
