import type { AppRole } from '../constants/roles';

export interface JwtPayload {
  sub: string;
  email: string;
  role: AppRole;
}

export interface JwtRefreshPayload extends JwtPayload {
  refreshToken: string;
}
