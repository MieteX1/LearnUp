import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer_type } from 'src/answer/answer.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('answer')
export class AnswerController {
  constructor(
    private readonly answerService: AnswerService,
  ) {}

  @Post()
  create(@Body() dto: CreateAnswerDto, @Req() req) {
    return this.answerService.create(dto, req.user.id);
  }
  
  @Get('task/')
  getAnswer(
      @Req() req,
      @Query('task') task_id: string,
      @Query('type') type: Answer_type
    ){
    return this.answerService.getByTaskId_UserId(+task_id, req.user.id, type);
  }

  @Get('answers/')
  getAnswers(
      @Req() req,
      @Query('collection') collection_id: string
    ){
    return this.answerService.getByCollectionId_UserId(+collection_id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnswerDto, @Req() req,) {
    return this.answerService.update(+id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('type') type: Answer_type, @Req() req,) {
    return this.answerService.remove(+id, type, req.user.id);
  }
}
