import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
{
    constructor(private authService: AuthService)
    {
        super({usernameField: 'email',passwordField: 'password'})// trzeba wskazać lokalnej strategii w tym miejscu jeśli będzie się przesyłać inaczej nazwane pola do walidacji niż domyślne(username,password)
    }

    async validate(email:string, password:string): Promise<any>
    {
        //console.log('Attempting to validate user:', email); // debugging
        const user = await this.authService.validateUser(email,password);

        if(!user)
        { 
           throw new UnauthorizedException('błędne dane logowania');
        }
        return user;
    }
}