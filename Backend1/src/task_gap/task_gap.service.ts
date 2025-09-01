import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskGapDto } from './dto/create-task_gap.dto';
import { UpdateTaskGapDto } from './dto/update-task_gap.dto';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Injectable()
export class TaskGapService {
  
  constructor(private prisma: PrismaService, private taskCollectionService:TaskCollectionService) {}
  
  async getById(id: number) {
    const task = await this.prisma.task_gap.findUnique({
      where: {
        id: +id
      }
    });
    task["type"] = "gap";

    if(!task) throw new NotFoundException('task not found');

    return task;
  }

  async findByCollectionId(id: number) {
    const tasks = await this.prisma.task_gap.findMany({
      where: {
        collection_id: +id
      }
    });

    if(!tasks) throw new NotFoundException('no gap tasks in collection');

    return tasks;
  }

  async create(dto: CreateTaskGapDto){
    return this.prisma.task_gap.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateTaskGapDto) {
    const task = await this.getById(id);

    return this.prisma.task_gap.update({
      where:{
        id: task.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const task = await this.getById(id);

    return this.prisma.task_gap.delete({
      where:{
        id: task.id
      }
    });
  }
}
