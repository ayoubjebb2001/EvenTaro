import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { resolveExpiresIn } from './utils/jwt-expires';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: {
        expiresIn: resolveExpiresIn(
          process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN,
          '15m',
        ),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    JwtAuthGuard,
    JwtRefreshAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
