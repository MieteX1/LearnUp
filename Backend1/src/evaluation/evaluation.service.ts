import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { PrismaService } from 'src/prisma.service';
import { getComments } from '@prisma/client/sql';

@Injectable()
export class EvaluationService {

  constructor(private prisma: PrismaService, ) {}

  async getById(id: number) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: {
        id: +id
      }
    });
    if(!evaluation) throw new NotFoundException('evaluation not found');

    return evaluation;
  }

  async getByCollectionId(id: number, userId?: number) {
    const evaluation = await this.prisma.$queryRawTyped(getComments(+id, userId || null));

    const formattedResult = JSON.parse(
      JSON.stringify(evaluation, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    if(!formattedResult) throw new NotFoundException('evaluation not found');

    return formattedResult;
  }

  create(dto: CreateEvaluationDto) {
    return this.prisma.evaluation.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateEvaluationDto) {
    const evaluation = await this.getById(id);

    return this.prisma.evaluation.update({
      where:{
        id: evaluation.id
      },
      data: dto,
    })
  }

  async delete(id: number) {
    const evaluation = await this.getById(id);

    return this.prisma.evaluation.update({
      where:{
        id: id
      },
      data:{
        is_deleted: true
      }
    });

    // return this.prisma.evaluation.deleteMany({
    //   where:{
    //     OR: [
    //       {
    //         id: evaluation.id
    //       },
    //       {
    //         answer: evaluation.id,
    //       },
    //     ],
    //   }
    // });
  }
}