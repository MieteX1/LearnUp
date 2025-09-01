import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTestOptionDto } from './dto/create-test_option.dto';
import { UpdateTestOptionDto } from './dto/update-test_option.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TestOptionService {
  
  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    const option = await this.prisma.test_option.findUnique({
      where: {
        id: +id
      }
    });

    if(!option) throw new NotFoundException('test option not found');

    return option;
  }

  async create(dto: CreateTestOptionDto) {
    return this.prisma.test_option.create({
      data: dto,
    });
  }

  async findByTestId(id: number) {
    const options = await this.prisma.test_option.findMany({
      where: {
        test_id: +id
      }
    });

    if(!options) throw new NotFoundException('no test option in test');

    return options;
  }

  async update(id: number, dto: UpdateTestOptionDto) {
    await this.getById(id);
    return this.prisma.test_option.update({
      where:{
        id: id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    await this.getById(id);
    return this.prisma.test_option.delete({
      where:{
        id: id
      }
    });
  }
}
