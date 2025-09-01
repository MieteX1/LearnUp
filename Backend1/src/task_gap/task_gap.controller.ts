import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TaskGapService } from './task_gap.service';
import { CreateTaskGapDto } from './dto/create-task_gap.dto';
import { UpdateTaskGapDto } from './dto/update-task_gap.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@UseGuards(JwtAuthGuard)
@Controller('task-gap')
export class TaskGapController {
  constructor(private readonly taskGapService: TaskGapService) {}

  @UseGuards(AccessGuard)
  @Access(AccessEntity.GAP_TASK)
  @Post()
  create(@Body() dto: CreateTaskGapDto) {
    return this.taskGapService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string){
    return this.taskGapService.getById(+id);
  }

  @Get('collection/:id')
  findByCollectionId(@Param('id') id: string) {
    return this.taskGapService.findByCollectionId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.GAP_TASK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskGapDto) {
    return this.taskGapService.update(+id, dto);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.GAP_TASK)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.taskGapService.delete(+id);
  }
}
