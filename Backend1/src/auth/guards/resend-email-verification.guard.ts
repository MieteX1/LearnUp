import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ResendEmailVerificationGuard extends AuthGuard('resend-email-verification') {}

