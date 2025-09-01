import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskMatchDto } from './dto/create-task_match.dto';
import { UpdateTaskMatchDto } from './dto/update-task_match.dto';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Injectable()
export class TaskMatchService {
  
  constructor(private prisma: PrismaService, private taskCollectionService:TaskCollectionService) {}
  
  async getById(id: number) {
    const task = await this.prisma.task_match.findUnique({
      where: {
        id: +id
      }
    });
    task["type"] = "match";

    if(!task) throw new NotFoundException('task not found');

    return task;
  }

  async findByCollectionId(id: number) {
    const tasks = await this.prisma.task_match.findMany({
      where: {
        collection_id: +id
      }
    });

    if(!tasks) throw new NotFoundException('no match tasks in collection');

    return tasks;
  }

  async create(dto: CreateTaskMatchDto){
    return this.prisma.task_match.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateTaskMatchDto) {
    const task = await this.getById(id);

    return this.prisma.task_match.update({
      where:{
        id: task.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const task = await this.getById(id);

    return this.prisma.task_match.delete({
      where:{
        id: task.id
      }
    });
  }
}
