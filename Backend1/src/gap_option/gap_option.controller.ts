import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GapOptionService } from './gap_option.service';
import { CreateGapOptionDto } from './dto/create-gap_option.dto';
import { UpdateGapOptionDto } from './dto/update-gap_option.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@UseGuards(JwtAuthGuard)
@Controller('gap-option')
export class GapOptionController {
  constructor(private readonly gapOptionService: GapOptionService) {}

  @UseGuards(AccessGuard)
  @Access(AccessEntity.GAP_OPTION)
  @Post()
  create(@Body() dto: CreateGapOptionDto) {
    return this.gapOptionService.create(dto);
  }

  @Get(':id')
  findByGap(@Param('id') id: string) {
    return this.gapOptionService.findByGapId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.GAP_OPTION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGapOptionDto) {
    return this.gapOptionService.update(+id, dto);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.GAP_OPTION)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.gapOptionService.delete(+id);
  }
}
