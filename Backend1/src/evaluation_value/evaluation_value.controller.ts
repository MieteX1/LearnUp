import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EvaluationValueService } from './evaluation_value.service';
import { CreateEvaluationValueDto } from './dto/create-evaluation_value.dto';
import { UpdateEvaluationValueDto } from './dto/update-evaluation_value.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@Controller('evaluation-value')
export class EvaluationValueController {
  constructor(private readonly evaluationValueService: EvaluationValueService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEvaluationValueDto) {
    return this.evaluationValueService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationValueService.getById(+id);
  }
  
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.VALUE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEvaluationValueDto) {
    return this.evaluationValueService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.VALUE)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.evaluationValueService.delete(+id);
  }
}
