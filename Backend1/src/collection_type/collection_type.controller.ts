import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CollectionTypeService } from './collection_type.service';
import { CreateCollectionTypeDto } from './dto/create-collection_type.dto';
import { UpdateCollectionTypeDto } from './dto/update-collection_type.dto';

@Controller('collection-type')
export class CollectionTypeController {
  constructor(private readonly collectionTypeService: CollectionTypeService) {}

  @Post()
  create(@Body() dto: CreateCollectionTypeDto) {
    return this.collectionTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.collectionTypeService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.collectionTypeService.getById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollectionTypeDto) {
    return this.collectionTypeService.update(+id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.collectionTypeService.delete(+id);
  }
}