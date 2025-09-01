import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class ResendEmailVerificationStrategy extends PassportStrategy(Strategy, 'resend-email-verification') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      secretOrKey: process.env.RESEND_VERIFIED_JWT_SECRET,      
      ignoreExpiration: false,        
      //passReqToCallback: true,                         
    });
  }

  async validate(payload: any) {
    return { email: payload.email }; // Walidacja payload, np. sprawdzenie emailu
  }
}