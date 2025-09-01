import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@UseGuards(JwtAuthGuard)
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @UseGuards(AccessGuard)
  @Access(AccessEntity.CARD)
  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.getById(+id);
  }

  @Get('collection/:id')
  findByCollection(@Param('id') id: string) {
    return this.cardService.findByCollectionId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.CARD)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(+id, updateCardDto);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.CARD)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.cardService.delete(+id);
  }
}
