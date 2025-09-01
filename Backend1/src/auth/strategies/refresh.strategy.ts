import { Injectable,UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";
import { AuthService } from '../auth.service';
import { Request } from 'express';

// Funkcja do wyciągania tokenu z ciasteczka
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['refreshToken'];
  }
  return null;
};
@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-jwt")
{
    constructor(private userService: UserService, private authService: AuthService){
        super({
            jwtFromRequest: cookieExtractor,
            ignoreExpiration: false,
            secretOrKey: process.env.REFRESH_JWT_SECRET,// zmienna z env która zawiera "podpis" serwera do generowania toketu
            passReqToCallback: true
        });
    }

    async validate(req: Request, payload: any) {
        const refreshToken = req.cookies['refreshToken'];
        const isValid = await this.authService.verifyRefreshToken(
            payload.sub,
            refreshToken
        );

        if (!isValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return {
            id: payload.sub,
        };
    }
}