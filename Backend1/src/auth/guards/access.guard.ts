import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AccessEntity } from './entity.acces.enum';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccess = this.reflector.getAllAndOverride<AccessEntity>(
      'entity',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredAccess) return true;
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const userRole = request.user.roles;
    const id = request.params.id;
    const dto = request.body;
    
    if (userRole == Role.admin) return true;
    return await this.isOwner(requiredAccess, +userId, +id, dto);
  }
  
  async isOwner(requiredAccess: AccessEntity, userId: number, entityId?: number, dto?: any){

    //for options check
      let task;
      let collection;
      let option;
      let tmp_id;

    switch (requiredAccess) {
      case AccessEntity.USER:
        return entityId == userId ? true : false;

      case AccessEntity.COLLECTION:
        collection = await this.prisma.task_collection.findUnique({
          where: {
            id: entityId,
            author_id: userId,
          },
        });
        return collection ? true : false;

      case AccessEntity.TEST_OPTION:
        if (dto?.test_id){
          tmp_id = dto.test_id;
        }
        else{
          option = await this.prisma.test_option.findUnique({where:{id:entityId}})
          tmp_id = option.test_id;
        }
        
        task = await this.prisma.task_test.findUnique({where:{id:tmp_id}})

        collection = await this.prisma.task_collection.findUnique({
          where:{
            id: task.collection_id, 
            author_id: userId
          }
        });
        return collection ? true : false;
      case AccessEntity.GAP_OPTION:
        if (dto?.gap_id){
          tmp_id = dto.gap_id;
        }
        else{
          option = await this.prisma.gap_option.findUnique({where:{id:entityId}})
          tmp_id = option.gap_id;
        }
        
        task = await this.prisma.task_gap.findUnique({where:{id:tmp_id}})

        collection = await this.prisma.task_collection.findUnique({
          where:{
            id: task.collection_id, 
            author_id: userId
          }
        });
        return collection ? true : false;
      case AccessEntity.MATCH_OPTION:
        if (dto?.match_id){
          tmp_id = dto.match_id;
        }
        else{
          option = await this.prisma.match_option.findUnique({where:{id:entityId}})
          tmp_id = option.match_id;
        }
        
        task = await this.prisma.task_match.findUnique({where:{id:tmp_id}})
        
        collection = await this.prisma.task_collection.findUnique({
          where:{
            id: task.collection_id, 
            author_id: userId
          }
        });
        return collection ? true : false;

      case AccessEntity.TEST_TASK:
        if (dto?.collection_id){
          collection = await this.getCollection(dto.collection_id, userId);
        }
        else{
          task = await this.prisma.task_test.findUnique({where:{id:entityId}})
          collection = await this.getCollection(task.collection_id, userId);
        }

        return collection ? true : false;
      case AccessEntity.OPEN_TASK:
        if (dto?.collection_id){
          collection = await this.getCollection(dto.collection_id, userId);
        }
        else{
          task = await this.prisma.task_open.findUnique({where:{id:entityId}})
          collection = await this.getCollection(task.collection_id, userId);
        }
        return collection ? true : false;
      case AccessEntity.MATCH_TASK:
        if (dto?.collection_id){
          collection = await this.getCollection(dto.collection_id, userId);
        }
        else{
          task = await this.prisma.task_match.findUnique({where:{id:entityId}})
          collection = await this.getCollection(task.collection_id, userId);
        }
        return collection ? true : false;
      case AccessEntity.GAP_TASK:
        if (dto?.collection_id){
          collection = await this.getCollection(dto.collection_id, userId);
        }
        else{
          task = await this.prisma.task_gap.findUnique({where:{id:entityId}})
          collection = await this.getCollection(task.collection_id, userId);
        }
        return collection ? true : false;
      case AccessEntity.CARD:
        if (dto?.collection_id){
          collection = await this.getCollection(dto.collection_id, userId);
        }
        else{
          task = await this.prisma.card.findUnique({where:{id:entityId}})
          collection = await this.getCollection(task.collection_id, userId);
        }
        return collection ? true : false;

      case AccessEntity.EVALUATION:
        const evaluation  = await this.prisma.evaluation.findUnique({
          where:{
            id: entityId,
            user_id: userId
          }
        });

        return evaluation ? true : false;
      case AccessEntity.VALUE:
        const value = await this.prisma.evaluation_value.findUnique({
          where:{
            id: entityId,
            evaluator_id: userId
          }
        });

        return value ? true : false;

      case AccessEntity.COMMENT:
        const comment = await this.prisma.evaluation.findUnique({
          where: {
            id: entityId,
            user_id: userId,
          },
        });
        return comment ? true : false;
      default:
        break;
    }
  } 

  async getCollection( collectionId: number, userId: number ){
    return await this.prisma.task_collection.findUnique({
      where:{
        id: collectionId,
        author_id: userId,
      }
    })
  }
}