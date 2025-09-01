import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { NotificationModule } from 'src/notification/notification.module';
import { EmailVerificationStrategy } from './strategies/email-verification.strategy';
import { ResendEmailVerificationStrategy } from './strategies/resend-email-verification.strategy';
import { ForgotPasswordStrategy } from './strategies/forgot-password.strategy';
import { CreateModeratorStrategy } from './strategies/create-moderator.strategy';

@Module({
  imports: [UserModule,NotificationModule, PassportModule.register({ defaultStrategy: 'local' }), JwtModule.register({
    secret: process.env.JWT_SECRET, // trzeba przenieść do env i ustawić jakiś hash( lub string)
    signOptions:{expiresIn: process.env.JWT_EXPIRE_IN},// token wygasa po 10h, może też trzeba przenieść do env?
  })],
  providers: [AuthService,LocalStrategy,PrismaService, JwtStrategy, RefreshJwtStrategy,EmailVerificationStrategy,ResendEmailVerificationStrategy,ForgotPasswordStrategy, CreateModeratorStrategy ],
  exports:[AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
