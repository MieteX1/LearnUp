import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TaskMatchService } from './task_match.service';
import { CreateTaskMatchDto } from './dto/create-task_match.dto';
import { UpdateTaskMatchDto } from './dto/update-task_match.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@UseGuards(JwtAuthGuard)
@Controller('task-match')
export class TaskMatchController {
  constructor(private readonly taskMatchService: TaskMatchService) {}


  @UseGuards(AccessGuard)
  @Access(AccessEntity.MATCH_TASK)
  @Post()
  create(@Body() dto: CreateTaskMatchDto) {
    return this.taskMatchService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string){
    return this.taskMatchService.getById(+id);
  }

  @Get('collection/:id')
  findByCollection(@Param('id') id: string) {
    return this.taskMatchService.findByCollectionId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.MATCH_TASK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskMatchDto) {
    return this.taskMatchService.update(+id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.taskMatchService.delete(+id);
  }
}
