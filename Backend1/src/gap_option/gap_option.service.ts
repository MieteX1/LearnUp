import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGapOptionDto } from './dto/create-gap_option.dto';
import { UpdateGapOptionDto } from './dto/update-gap_option.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GapOptionService {

  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    const option = await this.prisma.gap_option.findUnique({
      where: {
        id: +id
      }
    });

    if(!option) throw new NotFoundException('gap option not found');

    return option;
  }
  
  async create(dto: CreateGapOptionDto) {
    return this.prisma.gap_option.create({
      data: dto,
    });
  }

  async findByGapId(id: number) {
    const options = await this.prisma.gap_option.findMany({
      where: {
        gap_id: +id
      }
    });

    if(!options) throw new NotFoundException('no gap option in task');

    return options;
  }

  async update(id: number, dto: UpdateGapOptionDto) {
    const option = await this.getById(id);
   
    return this.prisma.gap_option.update({
      where:{
        id: option.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const option = await this.getById(id);
    
    return this.prisma.gap_option.delete({
      where:{
        id: option.id
      }
    });
  }
}
