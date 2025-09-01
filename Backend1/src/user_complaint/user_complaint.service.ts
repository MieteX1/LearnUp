import { Injectable } from '@nestjs/common';
import { CreateUserComplaintDto } from './dto/create-user_complaint.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserComplaintService {
  constructor(private prisma: PrismaService) {}
  
  async create(dto: CreateUserComplaintDto) {
    return await this.prisma.user_complaint.create({
      data: dto,
    });
  }

  async findAll() {
  return await this.prisma.user_complaint.findMany({
    include: {
      disturber: {
        select: {
          login: true,
        }
      },
      appliciant: {
        select: {
          login: true,
        }
      }
    }
  });
}

  async findOne(id: number) {
    const complaint = await this.prisma.user_complaint.findUnique({
      where: {
        id: id
      },
    });
    return complaint;
  }

  async update(id: number) {
    const complaint = await this.findOne(id);
    return await this.prisma.user_complaint.update({
      where:{
        id: complaint.id
      },
      data: {
        solved_at: new Date()
      }
    })
  }

  async remove(id: number) {
    const complaint = await this.findOne(id);

    return await this.prisma.user_complaint.delete({
      where:{
        id: complaint.id,
      }
    });
  }
}
