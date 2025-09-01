import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
  
  @Injectable()
  export class UserActivityInterceptor implements NestInterceptor {
    constructor(private readonly userService: UserService, private readonly prisma: PrismaService) {}
  
  async intercept(context: ExecutionContext, next: CallHandler) 
  {
      const request = context.switchToHttp().getRequest();
      const user = request.user; // pobranie z rozkodowanego tokenu dostępu danych usera.
      if (user?.id) {
        const UserfromDataBase = await this.userService.getById(user.id)
        //console.log("Data z bazy przed aktualizacją: ",UserfromDataBase.last_activity )
        const currentTime = new Date()
        currentTime.setSeconds(0);
        currentTime.setMilliseconds(0);
        if(!UserfromDataBase.last_activity )
          {
            await this.userService.UpdateOnlineDate(user.id, currentTime)
            await this.prisma.activity_archive.create({
              data: {
                userId: user.id,
                createAt: currentTime,
              }});

            return next.handle();
          }
        const timeDifference = currentTime.getTime() - UserfromDataBase.last_activity.getTime()
        // Aktualizacjia last_activity  użytkownika jeśli ten zapisany w bazie jest wcześniejszy o 5min od aktualnego czasu
        if(timeDifference >= 5*60*1000)//5 min
        {
        await this.userService.UpdateOnlineDate(user.id, currentTime)
        await this.prisma.activity_archive.create({
            data: {
              userId: user.id,
              createAt: currentTime,
            }});
          const DataPoUpdate = await this.userService.getById(user.id)
          //console.log("Data po aktualizacji: ",DataPoUpdate.last_activity )
        }
      }
      return next.handle();
    }
  }
  