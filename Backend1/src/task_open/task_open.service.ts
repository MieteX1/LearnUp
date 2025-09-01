import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskOpenDto } from './dto/create-task_open.dto';
import { UpdateTaskOpenDto } from './dto/update-task_open.dto';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Injectable()
export class TaskOpenService {

  constructor(private prisma: PrismaService, private taskCollectionService:TaskCollectionService) {}

  async getById(id: number) {
    const task = await this.prisma.task_open.findUnique({
      where: {
        id: +id
      }
    });
    task["type"] = "open";
    if(!task) throw new NotFoundException('task not found');

    return task;
  }

  async findByCollectionId(id: number) {
    const tasks = await this.prisma.task_open.findMany({
      where: {
        collection_id: +id
      }
    });

    if(!tasks) throw new NotFoundException('no open tasks in collection');

    return tasks;
  }

   async create(dto: CreateTaskOpenDto){
    return this.prisma.task_open.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateTaskOpenDto) {
    const task = await this.getById(id);
    return this.prisma.task_open.update({
      where:{
        id: task.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const task = await this.getById(id);
    return this.prisma.task_open.delete({
      where:{
        id: task.id
      }
    });
  }
}
