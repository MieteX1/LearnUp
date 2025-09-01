import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserComplaintService } from './user_complaint.service';
import { CreateUserComplaintDto } from './dto/create-user_complaint.dto';
import { UpdateUserComplaintDto } from './dto/update-user_complaint.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/custom_decorator/hasRole.decorator';

@UseGuards(JwtAuthGuard)
@Controller('user-complaint')
export class UserComplaintController {
  constructor(private readonly userComplaintService: UserComplaintService) {}

  @Post()
  create(@Body() dto: CreateUserComplaintDto) {
    return this.userComplaintService.create(dto);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get()
  findAll() {
    return this.userComplaintService.findAll();
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userComplaintService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.userComplaintService.update(+id);
  }

  @UseGuards(RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userComplaintService.remove(+id);
  }
}
