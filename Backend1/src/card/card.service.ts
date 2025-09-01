import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma.service';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Injectable()
export class CardService {
  
  constructor(private prisma: PrismaService, private taskCollectionService:TaskCollectionService) {}
  
  async getById(id: number) {
    const task = await this.prisma.card.findUnique({
      where: {
        id: +id
      }
    });
    task["type"] = "card";

    if(!task) throw new NotFoundException('card not found');

    return task;
  }

  create(dto: CreateCardDto) {
    return this.prisma.card.create({
      data: dto
    });
  }

  async findByCollectionId(id: number) {
    const cards = await this.prisma.card.findMany({
      where: {
        collection_id: +id
      }
    });

    if(!cards) throw new NotFoundException('no cards in collection');

    return cards;
  }

  async update(id: number, dto: UpdateCardDto) {
    const card = await this.getById(id);

    return this.prisma.card.update({
      where:{
        id: card.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const card = await this.getById(id);

    return this.prisma.card.delete({
      where:{
        id: card.id
      }
    });
  }
}
