import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CollectionComplaintService } from './collection_complaint.service';
import { CreateCollectionComplaintDto } from './dto/create-collection_complaint.dto';
import { UpdateCollectionComplaintDto } from './dto/update-collection_complaint.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/custom_decorator/hasRole.decorator';

@UseGuards(JwtAuthGuard)
@Controller('collection-complaint')
export class CollectionComplaintController {
  constructor(private readonly collectionComplaintService: CollectionComplaintService) {}

  @Post()
  create(@Body() dto: CreateCollectionComplaintDto) {
    return this.collectionComplaintService.create(dto);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get()
  findAll() {
    return this.collectionComplaintService.findAll();
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionComplaintService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.collectionComplaintService.update(+id);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionComplaintService.remove(+id);
  }
}
