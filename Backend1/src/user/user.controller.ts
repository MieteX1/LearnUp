import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  BadRequestException,
  ForbiddenException, Patch
} from "@nestjs/common";
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { RegisterUserDto } from './dto/Register_user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/custom_decorator/hasRole.decorator';
import { Access } from 'src/custom_decorator/access.decorator';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { AccessGuard } from 'src/auth/guards/access.guard';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, ) {}//private readonly authService: AuthService

  @UseGuards(JwtAuthGuard, RolesGuard)// strażnik, który sprawdza czy użytkownik ma ważny token dostępu
  @HasRoles(Role.admin,Role.moderator)
  @Get('all-users-total-times')// zwraca wszyskich użytkowników z czasem przebywania na stronie 
  async getAllUsersTotalTimes(@Req() req) {
    const userId = null;
    let startDate = null;
    let endDate = null;
    if(req.body.startDate && req.body.endDate)// jeśli wartości startDate i endDate zostały podane to należy brać pod uwagę dane tylko z tego przedziału
    {
       startDate = new Date(req.body.startDate);
       endDate =new Date(req.body.endDate);
    }
    return this.userService.GetActivityArchive(userId,startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)// strażnik, który sprawdza czy użytkownik ma ważny token dostępu
  @Get('total-times')// zwraca czas przebywania na stronie dla podanego w tokenie użytkownika
  async getUserTotalTimes(@Req() req)
   {
    const userId = req.user.id;
    let startDate = null;
    let endDate = null;
    if(req.body.startDate && req.body.endDate)// jeśli wartości startDate i endDate zostały podane to należy brać pod uwagę dane tylko z tego przedziału
    {
       startDate = new Date(req.body.startDate);
       endDate =new Date(req.body.endDate);
    }
    return this.userService.GetActivityArchive(userId,startDate, endDate);
  }
  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.admin,Role.moderator)
  @Get('unverified')
  async findUnverified() {
    return this.userService.findUnverified();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.admin, Role.moderator)
  @Get('banned')
  async getBannedUsers() {
      return this.userService.findBanned();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(
    @Param('id') id: string,
    @Req() req
  ) {
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.roles;

    return this.userService.getUserWithAccessControl(
      +id,
      requestingUserId,
      requestingUserRole
    );
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: RegisterUserDto){
    return this.userService.create(dto);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.USER)
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto){
   
    return this.userService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Access(AccessEntity.USER)
  @Delete(':id')
  async delete(@Param('id') id: string, @Body() {password}:{password: string}){
    return this.userService.delete(+id,password);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.admin)
  @Patch('admin-delete/:id')
  async adminDeleteUser(
      @Param('id') id: string,
      @Req() req
  ) {
      // Check if admin is trying to delete themselves
      if (req.user.id === +id) {
          throw new BadRequestException('Admin cannot delete their own account');
      }
      return this.userService.adminDeleteUser(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.admin, Role.moderator)
  @Post('ban/:id')
  async banUser(
      @Param('id') id: string,
      @Req() req
  ) {
      // Sprawdzenie czy moderator nie próbuje zbanować admina
      const targetUser = await this.userService.getById(+id);
      if (req.user.roles === Role.moderator && (targetUser.role === Role.admin || targetUser.role === Role.moderator)) {
          throw new ForbiddenException('Moderator cannot ban administrator or another moderator');
      }

      return this.userService.banUser(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.admin)
  @Post('unban/:id')
  async unbanUser(
      @Param('id') id: string
  ) {
      return this.userService.unbanUser(+id);
  }


}
