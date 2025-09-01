import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class EmailVerificationGuard extends AuthGuard('email-verification') implements CanActivate {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
