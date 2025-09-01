import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class EmailVerificationStrategy extends PassportStrategy(Strategy, 'email-verification') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'), // Pobiera token z parametru URL
      secretOrKey: process.env.VERIFIED_JWT_SECRET,          // Sekret dla tokenu weryfikacyjnego
      ignoreExpiration: false,                                  // Token musi być ważny
    });
  }

  async validate(payload: any) {
    return { email: payload.email }; // Walidacja payload, np. sprawdzenie emailu
  }
}