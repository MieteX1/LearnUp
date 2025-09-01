import { Reflector } from "@nestjs/core";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate{

    constructor(private reflector: Reflector){}
    canActivate(context: ExecutionContext): boolean{
            const requireRoles = this.reflector.getAllAndOverride<Role[]>('roles',[
                context.getHandler(),
                context.getClass(),
            ])
            if(!requireRoles)// jeśli nie są potrzebne żadne role dla ściezki to sprawdzamy to tutaj i zwracamy true jeśli z kontekstu przed trasą nie została przechwycona żadna wymagana rola
        {
            return true
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;// zmienić na .roles
       // console.log("User in RolesGuard:", request);//debugging

         //console.log("User in RolesGuard:", typeof user);//debugging
         return requireRoles.some(role => user?.roles?.includes(role));
    }
}