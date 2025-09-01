import { Injectable } from '@nestjs/common';
import { CreateCollectionComplaintDto } from './dto/create-collection_complaint.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CollectionComplaintService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCollectionComplaintDto) {
    return await this.prisma.collection_complaint.create({
      data: dto,
    });
  }

  async findAll() {
    return await this.prisma.collection_complaint.findMany({
      include: {
        appliciant: {
          select: {
            login: true,
          }
        },
        task_collection: {
          select: {
            name: true,
            author: {
              select: {
                id: true,
                login: true,
              }
            }
          }
        }
      }
    });
  }

  async findOne(id: number) {
    const complaint = await this.prisma.collection_complaint.findUnique({
      where: {
        id: id
      },
      include:{
        appliciant: {
          select:{
            login: true,
          }
        }
      }
    });
    return complaint;
  }

  async update(id: number) {
    const complaint = await this.findOne(id);
    return await this.prisma.collection_complaint.update({
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

    return await this.prisma.collection_complaint.delete({
      where:{
        id: complaint.id,
      }
    });
  }
}