import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class ForgotPasswordStrategy extends PassportStrategy(Strategy, 'forgot-password') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'), // Pobiera token z parametru URL
      secretOrKey: process.env.FORGOT_PASSWORD_JWT_SECRET,          // Sekret dla tokenu weryfikacyjnego
      ignoreExpiration: false,                                  // Token musi być ważny
    });
  }

  async validate(payload: any) {
    return { email: payload.email }; // Walidacja payload, np. sprawdzenie emailu
  }
}