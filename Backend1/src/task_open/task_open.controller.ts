import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TaskOpenService } from './task_open.service';
import { CreateTaskOpenDto } from './dto/create-task_open.dto';
import { UpdateTaskOpenDto } from './dto/update-task_open.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';
@UseGuards(JwtAuthGuard)
@Controller('task-open')
export class TaskOpenController {
  constructor(private readonly taskOpenService: TaskOpenService) {}
  // strażnik, który sprawdza czy użytkownik ma ważny token który był generowany przy logowaniu
  @UseGuards(AccessGuard)
  @Access(AccessEntity.OPEN_TASK)
  @Post()
  create(@Body() dto: CreateTaskOpenDto) {
    return this.taskOpenService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string){
    return this.taskOpenService.getById(+id);
  }

  @Get('collection/:id')
  findByCollection(@Param('id') id: string) {
    return this.taskOpenService.findByCollectionId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.OPEN_TASK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskOpenDto) {
    return this.taskOpenService.update(+id, dto);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.OPEN_TASK)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.taskOpenService.delete(+id);
  }
}
