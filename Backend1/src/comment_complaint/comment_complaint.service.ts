import { Injectable } from '@nestjs/common';
import { CreateCommentComplaintDto } from './dto/create-comment_complaint.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CommentComplaintService {
  constructor(private prisma: PrismaService) {}
  
  async create(dto: CreateCommentComplaintDto) {
    return await this.prisma.comment_complaint.create({
      data: dto,
    });
  }

  async findAll() {
  return await this.prisma.comment_complaint.findMany({
    include: {
      appliciant: {
        select: {
          login: true,
        }
      },
      comment: {
        select: {
          comment: true,
          user_id: true,
          collection_id: true,
          user: {
            select: {
              login: true
            }
          }
        }
      }
    }
  });
}

  async findOne(id: number) {
    const complaint = await this.prisma.comment_complaint.findUnique({
      where: {
        id: id
      },
    });
    return complaint;
  }

  async update(id: number) {
    const complaint = await this.findOne(id);
    return await this.prisma.comment_complaint.update({
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

    return await this.prisma.comment_complaint.delete({
      where:{
        id: complaint.id,
      }
    });
  }
}
