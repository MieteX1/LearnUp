import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSubscriptionDto, @Req() req) {
    dto.subscriber_id = req.user.id;
    return this.subscriptionService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/')
  getByUser(@Req() req) {
    return this.subscriptionService.getByUserId(req.user.id);
  }
  @Get('collection/:id')
  getByCollection(@Param('id') id: string) {
    return this.subscriptionService.getByCollectionId(+id);
  }
  //zwraca true/false
  @UseGuards(JwtAuthGuard)
  @Get('check/collection/:collection_id')
  checkSubscription(
    @Param('collection_id') collection_id: string,
    @Req() req
  ) {
    return this.subscriptionService.getByUserIdAndCollectionId(req.user.user.id, +collection_id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto, @Req() req) {
    return this.subscriptionService.toggleNotification(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.subscriptionService.delete(+id, req.user.id);
  }
}
