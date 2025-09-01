import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskTestDto } from './dto/create-task_test.dto';
import { UpdateTaskTestDto } from './dto/update-task_test.dto';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Injectable()
export class TaskTestService {

  constructor(private prisma: PrismaService,private taskCollectionService:TaskCollectionService) {}

  async getById(id: number) {
    const task = await this.prisma.task_test.findUnique({
      where: {
        id: +id
      }
    });
    task["type"] = "test";

    if(!task) throw new NotFoundException('task not found');

    return task;
  }

  async findByCollectionId(id: number) {
    const tasks = await this.prisma.task_test.findMany({
      where: {
        collection_id: +id
      }
    });

    if(!tasks) throw new NotFoundException('no test tasks in collection');

    return tasks;
  }

   async create(dto: CreateTaskTestDto){
    return this.prisma.task_test.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateTaskTestDto) {
    const task = await this.getById(id);
    return this.prisma.task_test.update({
      where:{
        id: task.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const task = await this.getById(id);
    return this.prisma.task_test.delete({
      where:{
        id: task.id
      }
    });
  }
}
