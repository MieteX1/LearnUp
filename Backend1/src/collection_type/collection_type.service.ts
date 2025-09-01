import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionTypeDto } from './dto/create-collection_type.dto';
import { UpdateCollectionTypeDto } from './dto/update-collection_type.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CollectionTypeService {

  constructor(private prisma: PrismaService) {}

  create(dto: CreateCollectionTypeDto) {
    return this.prisma.collection_type.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.collection_type.findMany();
  }

  async getById(id: number) {
    const type = await this.prisma.collection_type.findUnique({
      where: {
        id: +id
      }
    });

    if(!type) throw new NotFoundException('type not found');

    return type;
  }

  async update(id: number, dto: UpdateCollectionTypeDto) {
    const type = await this.getById(id);
    return this.prisma.collection_type.update({
      where:{
        id: type.id
      },
      data:{
        name: dto.name
      }
    })
  }

  async delete(id: number) {
    const type = await this.getById(id);

    return this.prisma.collection_type.delete({
      where:{
        id: type.id
      }
    });
  }
}