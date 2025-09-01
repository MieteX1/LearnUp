import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TaskTestService } from './task_test.service';
import { CreateTaskTestDto } from './dto/create-task_test.dto';
import { UpdateTaskTestDto } from './dto/update-task_test.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';


@UseGuards(JwtAuthGuard)
@Controller('task-test')
export class TaskTestController {
  constructor(private readonly taskTestService: TaskTestService) {}

  @UseGuards(AccessGuard)
  @Access(AccessEntity.TEST_TASK)
  @Post()
  create(@Body() dto: CreateTaskTestDto) {
    return this.taskTestService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string){
    return this.taskTestService.getById(+id);
  }

  @Get('collection/:id')
  findByCollection(@Param('id') id: string) {
    return this.taskTestService.findByCollectionId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.TEST_TASK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskTestDto) {
    return this.taskTestService.update(+id, dto);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.TEST_TASK)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.taskTestService.delete(+id);
  }
}
