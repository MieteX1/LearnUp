import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { HasRoles } from './custom_decorator/hasRole.decorator';
import { Role } from '@prisma/client';

@Controller('api')
export class AppController {
  constructor(
    private prisma: PrismaService, 
    private authService: AuthService
  ){}

  
  // @Post('user')
  // async registerUser(@Body() body: { login: string; email: string; password: string }) {
  //   const { email, login, password } = body;

  //   const newUser = await this.prisma.user.create({
  //     data: {
  //       email,
  //       login,
  //       password,
  //     },
  //   });

  //   return { message: 'Rejestracja zakończona sukcesem' };
  // }

  @Get('test')
  testEndpoit()
  {
    return 'test test';
  }

//ścieżka logowania. 
  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // login(@Request() req): any{
  //   return this.authService.login(req.user);
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)// strażnik, który sprawdza czy użytkownik ma ważny token który był generowany przy logowaniu
  @HasRoles(Role.user, Role.admin)// sprawdzanie czy w tokenie użytkownika jest odpowiednia rola
  @Get('protectRouteExample')
  Hello(@Request() req): string{
    return req.user;

  }

}
