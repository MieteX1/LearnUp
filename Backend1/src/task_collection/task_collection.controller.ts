import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from "@nestjs/common";
import { TaskCollectionService } from './task_collection.service';
import { CreateTaskCollectionDto } from './dto/create-task_collection.dto';
import { UpdateTaskCollectionDto } from './dto/update-task_collection.dto';
import { collectionFilter } from './collection.filter';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';
import { CreateRank } from './dto/create-rank.dto';

@Controller('task-collection')
export class TaskCollectionController {
  constructor(private readonly taskCollectionService: TaskCollectionService) {}

  @UseGuards(JwtAuthGuard)// strażnik, który sprawdza czy użytkownik ma ważny token który był generowany przy logowaniu
  @Post()
  create(@Body() dto: CreateTaskCollectionDto, @Req() req) {
    dto.author_id = req.user.id;
    return this.taskCollectionService.create(dto);
  }

  @Get('all')
  findAll() {
    return this.taskCollectionService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('progress/:collectionId')
  getProgress(
    @Req() req,
    @Param('collectionId') collection_id: string){
    return this.taskCollectionService.getProgress(req.user.id, +collection_id);
  }
  @Post('filter')
  findWithFilter(@Body() filter: collectionFilter) {
    return this.taskCollectionService.findManyWithFilter(filter);
  }
  @Get('rank/:id')
  getRank(@Param('id') id: string){
    return this.taskCollectionService.getRank(+id);
  }
  @Get('rank/:collection_id/user/:user_id')
  getRankByUserAndCollection(@Param('user_id') userId: string, @Param('collection_id') collectionId: string){
    return this.taskCollectionService.getRankByUserIdAndCollectionId(+userId, +collectionId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('rank/:id')
  setRank(
    @Param('id') id: string,
    @Body() createRankDto: CreateRank,
    @Req() req
  ) {
    // Pobieramy id użytkownika z tokena JWT
    const userId = req.user.id;
    return this.taskCollectionService.setRank({
      user_id: userId,
      collection_id: +id,
      points: createRankDto.points
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-collections')
  async getUserCollections(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('type') type?: 'owned' | 'subscribed' | 'all'
  ) {
    return this.taskCollectionService.getUserCollections(
      req.user.id,
      limit ? parseInt(limit) : undefined,
      type || 'all'
    );
  }
  @Get('author/:id')
  getByAuthor(@Param('id') id: string){
    return this.taskCollectionService.getByAuthorId(+id);
  }

  @Get('tasks/:id')
  getTasks(@Param('id') id: string) {
    return this.taskCollectionService.findTasks(+id);
  }
  @Get('tasks-with/:id/:line')
  getTasksWhitText(@Param('id') id: string, @Param('line') text: string) {
    return this.taskCollectionService.findTaskWhitText(+id, text);
  }
  @Get('search/:line')
  getCollectionWhitText(@Param('line') text: string) {
    return this.taskCollectionService.findCollectionWhitText(text);
  }
  @Get('subs/:id')
  getNumberSubscribers(@Param('id') id: string){
    return this.taskCollectionService.howManySubscribers(+id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string, @Req() req) {
    const userRole = req.user.roles;
    return this.taskCollectionService.getById(+id, userRole);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.COLLECTION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskCollectionDto) {
    return this.taskCollectionService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.COLLECTION)
  @UseGuards(JwtAuthGuard)
  @Patch('delete/:id')
  safelyDelete(@Param('id') id: string){
    return this.taskCollectionService.softDelete(+id);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.COLLECTION)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.taskCollectionService.delete(+id);
  }
}
