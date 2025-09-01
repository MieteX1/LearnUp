import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { EvaluationValueService } from '../evaluation_value/evaluation_value.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@Controller('evaluation')
export class EvaluationController {
  constructor(
    private readonly evaluationService: EvaluationService,
    private readonly evaluationValueService: EvaluationValueService
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationService.getById(+id);
  }

   @UseGuards(JwtAuthGuard)
  @Get('collection/:id')
  getByCollection(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    return this.evaluationService.getByCollectionId(+id, userId);
  }
  @Get(':id/value')
  getValue(@Param('id') id: string) {
    return this.evaluationValueService.getValue(+id);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.EVALUATION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
    return this.evaluationService.update(+id, dto);
  }
  
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.EVALUATION)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.evaluationService.delete(+id);
  }
}
