import '../../config/env.loader';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  JwtPayload,
  JwtRefreshPayload,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'changeme',
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: JwtPayload): JwtRefreshPayload {
    const authorization = request.get('authorization') ?? '';
    const refreshToken = authorization.replace('Bearer', '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    return { ...payload, refreshToken };
  }
}
