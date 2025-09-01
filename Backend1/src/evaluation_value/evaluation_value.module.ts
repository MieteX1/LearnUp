import { Module } from '@nestjs/common';
import { EvaluationValueService } from './evaluation_value.service';
import { EvaluationValueController } from './evaluation_value.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [EvaluationValueController],
  providers: [EvaluationValueService, PrismaService],
})
export class EvaluationValueModule {}
