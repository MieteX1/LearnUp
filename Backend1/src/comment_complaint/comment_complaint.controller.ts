import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CommentComplaintService } from './comment_complaint.service';
import { CreateCommentComplaintDto } from './dto/create-comment_complaint.dto';
import { UpdateCommentComplaintDto } from './dto/update-comment_complaint.dto';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { HasRoles } from 'src/custom_decorator/hasRole.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comment-complaint')
export class CommentComplaintController {
  constructor(private readonly commentComplaintService: CommentComplaintService) {}

  @Post()
  create(@Body() dto: CreateCommentComplaintDto) {
    return this.commentComplaintService.create(dto);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get()
  findAll() {
    return this.commentComplaintService.findAll();
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentComplaintService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.commentComplaintService.update(+id);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentComplaintService.remove(+id);
  }
}
