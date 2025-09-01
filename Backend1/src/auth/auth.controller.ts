import { Body, Controller, Get, Post, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterUserDto } from 'src/user/dto/Register_user.dto';
import { RefreshJwtAuthGuard } from './guards/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { NotificationService } from 'src/notification/notification.service';
import { EmailVerificationGuard } from './guards/email-verification.guard';
import { ResendEmailVerificationGuard } from './guards/resend-email-verification.guard';
import { ForgotPasswordGuard } from './guards/forgot-password.guard';
import { RolesGuard } from './guards/roles.guard';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/custom_decorator/hasRole.decorator';
import { Response } from 'express';
import { createModeratorDTO } from 'src/user/dto/create_moderator.dto';
import { CreateModeratorGuard } from './guards/create-moderator.guard';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly notificationService: NotificationService){}
    //ścieżka rejestracji użytkownika. 
    @Post('register')
    async registerUser(@Body() registerUserDto:RegisterUserDto)
    {
        return this.authService.register(registerUserDto);
    }
    @UseGuards(JwtAuthGuard, RolesGuard)// strażnik, który sprawdza czy użytkownik ma ważny token który był generowany przy logowaniu
    @HasRoles(Role.admin)
    @Post('create-moderator')
    async createModerator(@Body() createModerator:createModeratorDTO)
    {
        return this.authService.createModerator(createModerator);
    }
    @UseGuards(CreateModeratorGuard)
    @Post('setup-moderator-password')
    endingCreateModerator(
      //@Query('token') token:string ,
      @Request() req,
      @Body() {password,login}:{password: string,login:string} )
    {
      //console.log({ token, password });
      const email = req.user?.email;
      return this.authService.setupModeratorPassword(email,password,login)
    }
    //ścieżka logowania użytkownika. 
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(req.user, res);
    }
    //ścieżka odświeżania tokenu.
    @UseGuards(RefreshJwtAuthGuard)
    @Post('refresh')
    async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
        return this.authService.refreshToken(req.user, res);
    }
    @UseGuards(JwtAuthGuard)
    @Get('verify')
    verify(@Req() req) {
        return req.user;
    }

    //ścieżka wylogowania użytkownika.
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
        return this.authService.logout(req.user.user.id, res);
    }

  @UseGuards(EmailVerificationGuard)
  @Get('verify-email')
  verifyEmail(@Query('token') token: string){//:  Promise<{ message: string }> 
    //console.log(token)
    return this.authService.verifyEmail(token);
  }

  @UseGuards(ResendEmailVerificationGuard)
  @Post('resend-verify-email')
  resendVeryfiEmail(@Request() req){//:  Promise<{ message: string }> 
    //console.log(req.user.email)
    
    return this.authService.resendVerifyEmail(req.user.email);

  }

  @Post('forgot-password')
  forgotPassword(@Body() {email}:{email: string}){
    //console.log(email);
    return this.authService.forgotPassword(email);
  }

  @UseGuards(ForgotPasswordGuard)
  @Post('reset-password')//reset forgot password
  resetPassword(
    @Query('token') token:string ,// tutaj można dać req zamiast query i nie przekazywać tokenu żeby był sprawdzany w servisie a tylko tutaj w guardzie
    @Body() {password}:{password: string} )
  {
    //console.log({ token, password });
    return this.authService.resetPassword(token,password)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)// strażnik, który sprawdza czy użytkownik ma ważny token który był generowany przy logowaniu
  @HasRoles(Role.user,Role.moderator ,Role.admin)
  @Post('change-password')//zmiana hasła z panelu użytkownika po zalogowaniu
  changePassword(
    @Request() req ,
    @Body() {newPassword,oldPassword}:{newPassword: string,oldPassword: string} )// to chyba nie powinno być przesyłane w body
  {
    return this.authService.changePassword(req.user.user.email,newPassword,oldPassword)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)// strażnik, który sprawdza czy użytkownik ma ważny token który był generowany przy logowaniu
  @HasRoles(Role.moderator, Role.admin)
  @Post('resending-verification-email-as-moderator')// ręczne wysłanie emailu weryfikacyjnego przez moda/admina na wypadek gdyby uzytkownik nie zweryfikował się i wyszedł ze strony na której może wysłać ponownie maila do weryfikacji.
  resendingVerificationEmail(
    @Body() {userEmail}:{userEmail: string} )
  {
    return this.authService.resendVerifyEmail(userEmail);// na razie na tym samym tokenie JWT co bezobsługowa weryfikacja, później może zmienić na inny aby miał dłuższy czas wygasania skoro prośba o nowy mail veryfikacyjny ma przechodzić przez kontakt czyli mailem.
  }
}
