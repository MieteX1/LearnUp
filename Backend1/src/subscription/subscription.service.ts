import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubscriptionService {

  constructor(private prisma: PrismaService,) {}

  async getById(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id: +id
      }
    });
    if(!subscription) throw new NotFoundException('subscription not found');

    return subscription;
  }

  async getByUserId(id: number) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        subscriber_id: +id
      },
    });
    if(!subscriptions) throw new NotFoundException('subscriptions not found');

    return subscriptions;
  }

  async getByCollectionId(id: number) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        collection_id: +id
      }
    });
    if(!subscriptions) throw new NotFoundException('subscriptions not found');

    return subscriptions;
  }

  async getByUserIdAndCollectionId(userId: number, collectionId: number){
    const subscriptions = await this.prisma.subscription.count({
      where: {
        collection_id: collectionId,
        subscriber_id: userId
      }
    });

    return subscriptions > 0;
  }

  create(dto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateSubscriptionDto) {
    const subscription = await this.getById(id);
    return this.prisma.subscription.update({
      where:{
        id: subscription.id
      },
      data: dto,
    })
  }

  async toggleNotification(id: number, userId: number){
    const subscription = await this.getById(id);
    return this.prisma.subscription.update({
      where:{
        id: subscription.id,
        subscriber_id: userId
      },
      data: {
        notification: !subscription.notification
      }
    })
  }

  async delete(id: number, userId: number) {
    const subscription = await this.getById(id);

    return this.prisma.subscription.delete({
      where:{
        id: subscription.id,
        subscriber_id: userId
      }
    });
  }
}
