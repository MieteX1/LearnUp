import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
    constructor(private userService: UserService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET// zmienna z env która zawiera "podpis" serwera do generowania toketu

        })
    }
     
    async validate(payload: any){
        // tutaj po zweryfikowaniu użytkownika tokenem można zwracać jakieś dane usera przez funkcje z userService
        const user =  await this.userService.getById(payload.sub);
        const { password,last_activity,ban_date,punishment,refresh_token,is_verified,deleted_at, ...result } = user;

        return{
            user: result,
            id: user.id,
            roles: user.role,
        }
    }
}