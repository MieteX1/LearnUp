import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MatchOptionService } from './match_option.service';
import { CreateMatchOptionDto } from './dto/create-match_option.dto';
import { UpdateMatchOptionDto } from './dto/update-match_option.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@UseGuards(JwtAuthGuard)
@Controller('match-option')
export class MatchOptionController {
  constructor(private readonly matchOptionService: MatchOptionService) {}

  @UseGuards(AccessGuard)
  @Access(AccessEntity.MATCH_OPTION)
  @Post()
  create(@Body() dto: CreateMatchOptionDto) {
    return this.matchOptionService.create(dto);
  }

  @Get(':id')
  findByMatch(@Param('id') id: string) {
    return this.matchOptionService.findByMatchId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.MATCH_OPTION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMatchOptionDto) {
    return this.matchOptionService.update(+id, dto);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.MATCH_OPTION)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.matchOptionService.delete(+id);
  }
}
