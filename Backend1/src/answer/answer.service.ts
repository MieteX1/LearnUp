import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer_type } from 'src/answer/answer.type';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnswerService {

  constructor(private prisma: PrismaService) {}

  async getByCollectionId_UserId(collection_id: number, user_id: number){
    
    return this.prisma.task_collection.findMany({
      select:{
        answer_test: {
          where: {
            user_id: user_id,
          },
        },
        answer_gap: {
          where: {
            user_id: user_id,
          },
        },
        answer_match: {
          where: {
            user_id: user_id,
          },
        },
        answer_open: {
          where: {
            user_id: user_id,
          },
        },
      },
      where:{
        id: collection_id,
      }
    });
  }

  async getByTaskId_UserId(task_id: number, user_id: number, type: Answer_type){  
    let answer:any;
    switch(type){
      case Answer_type.OPEN: 
        answer = await this.prisma.answer_open.findMany({
          where: {
            open_id: +task_id,
            user_id: user_id
          }
        });
        break;
      case Answer_type.GAP:
        answer = await this.prisma.answer_gap.findMany({
          where: {
            gap_id: +task_id,
            user_id: user_id
          }
        });
        break;
      case Answer_type.MATCH:
        answer = await this.prisma.answer_match.findMany({
          where: {
            match_id: +task_id,
            user_id: user_id
          }
        });
        break;
      case Answer_type.TEST:
        answer = await this.prisma.answer_test.findMany({
          where: {
            test_id: +task_id,
            user_id: user_id
          }
        });
        break;
    }
    
    if(!answer) throw new NotFoundException('answer not found');

    return answer
  }

  async getById(id: number, type: Answer_type) {
    let answer:any;

    switch(type){
      case Answer_type.OPEN: 
        answer = await this.prisma.answer_open.findUnique({
          where: {
            id: +id
          }
        });
        break;
      case Answer_type.GAP:
        answer = await this.prisma.answer_gap.findUnique({
          where: {
            id: +id
          }
        });
        break;
      case Answer_type.MATCH:
        answer = await this.prisma.answer_match.findUnique({
          where: {
            id: +id
          }
        });
        break;
      case Answer_type.TEST:
        answer = await this.prisma.answer_test.findUnique({
          where: {
            id: +id
          }
        });
        break;
    }

    if(!answer) throw new NotFoundException('answer not found');

    return answer;
  }

  async create(dto: CreateAnswerDto, user_id: number) {
    let answer:any;

    switch(dto.type){
      case Answer_type.OPEN: 
        answer = this.prisma.answer_open.create({
          data: {
            user_id: user_id,
            collection_id: dto.collection_id,
            open_id: dto.open_id,
            answer: dto.answer
          } 
        });
        break;
      case Answer_type.GAP:
        answer = this.prisma.answer_gap.create({
          data: {
            user_id: user_id,
            collection_id: dto.collection_id,
            option_id: dto.option_id,
            gap_id: dto.gap_id,
            answer: dto.answer
          } 
        });
        break;
      case Answer_type.MATCH:
        answer = this.prisma.answer_match.create({
          data: {
            user_id: user_id,
            collection_id: dto.collection_id,
            option_id: dto.option_id,
            match_id: dto.match_id,
            answer_id: dto.answer_id
          }
        });
        break;
      case Answer_type.TEST:
        answer = this.prisma.answer_test.create({
          data: {
            user_id: user_id,
            collection_id: dto.collection_id,
            option_id: dto.option_id,
            test_id: dto.test_id
          }
        });
        break;
    }
    return answer;
  }
 
  async update(id: number, dto: UpdateAnswerDto, authorId:number) {
    const answer = await this.getById(id, dto.type);
    if(answer.user_id != authorId)
      {
        throw new NotFoundException('not a author')
      }
    switch(dto.type){
      case Answer_type.OPEN: 
      return this.prisma.answer_open.update({
        where:{
          id: answer.id
        },
        data: dto,
      })
      case Answer_type.GAP:
        return this.prisma.answer_gap.update({
          where:{
            id: answer.id
          },
          data: dto,
        })
      case Answer_type.MATCH:
        return this.prisma.answer_match.update({
          where:{
            id: answer.id
          },
          data: dto,
        })
      case Answer_type.TEST:
        return this.prisma.answer_test.update({
          where:{
            id: answer.id
          },
          data: dto,
        })
    }
  }

  async remove(id: number, type: Answer_type, authorId:number) {
    const answer = await this.getById(id, type);
    if(answer.user_id != authorId)
      {
        throw new NotFoundException('not a author')
      }
    switch(type){
      case Answer_type.OPEN: 
      return this.prisma.task_open.delete({
        where:{
          id: answer.id
        }
      })
      case Answer_type.GAP:
        return this.prisma.task_gap.delete({
          where:{
            id: answer.id
          }
        })
      case Answer_type.MATCH:
        return this.prisma.task_match.delete({
          where:{
            id: answer.id
          }
        })
      case Answer_type.TEST:
        return this.prisma.task_test.delete({
          where:{
            id: answer.id
          }
        })
    }
  }
}
