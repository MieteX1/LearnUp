import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CreateModeratorGuard extends AuthGuard('create-moderator') implements CanActivate { // potrzebny w mailu dla moda w którym ustawia sobie hasło i veryfikuje konto.
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
