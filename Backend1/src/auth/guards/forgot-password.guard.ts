import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ForgotPasswordGuard extends AuthGuard('forgot-password') implements CanActivate {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
