import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMatchOptionDto } from './dto/create-match_option.dto';
import { UpdateMatchOptionDto } from './dto/update-match_option.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MatchOptionService {

  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    const option = await this.prisma.match_option.findUnique({
      where: {
        id: +id
      }
    });

    if(!option) throw new NotFoundException('match option not found');

    return option;
  }

  async create(dto: CreateMatchOptionDto) {
    return this.prisma.match_option.create({
      data: dto,
    });
  }

  async findByMatchId(id: number) {
    const options = await this.prisma.match_option.findMany({
      where: {
        match_id: +id
      }
    });

    if(!options) throw new NotFoundException('no match option in task');

    return options;
  }

  async update(id: number, dto: UpdateMatchOptionDto) {
    const option = await this.getById(id);
    
    return this.prisma.match_option.update({
      where:{
        id: option.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const option = await this.getById(id);
   
    return this.prisma.match_option.delete({
      where:{
        id: option.id
      }
    });
  }
}
