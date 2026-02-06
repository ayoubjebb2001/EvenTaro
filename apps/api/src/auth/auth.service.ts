import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { resolveExpiresIn } from './utils/jwt-expires';
import { AppRole } from './constants/roles';
import type { UserModel } from '../generated/prisma/models/User';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly accessSecret = process.env.JWT_SECRET ?? 'changeme';
  private readonly accessExpiresIn = resolveExpiresIn(
    process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN,
    '15m',
  );
  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET ?? this.accessSecret;
  private readonly refreshExpiresIn = resolveExpiresIn(
    process.env.JWT_REFRESH_EXPIRES_IN,
    '30d',
  );

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await this.hashData(registerDto.password);
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      role: AppRole.USER,
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return this.buildAuthResponse(user, tokens);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.compareData(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return this.buildAuthResponse(user, tokens);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setHashedRefreshToken(userId, null);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshMatches = await this.compareData(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!refreshMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return this.buildAuthResponse(user, tokens);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.toResponseDto(user);
  }

  private async generateTokens(user: UserModel): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await this.hashData(refreshToken);
    await this.usersService.setHashedRefreshToken(userId, hashedToken);
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, SALT_ROUNDS);
  }

  private async compareData(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }

  private buildAuthResponse(
    user: UserModel,
    tokens: AuthTokens,
  ): AuthResponseDto {
    const safeUser: UserResponseDto = this.usersService.toResponseDto(user);
    return { user: safeUser, ...tokens };
  }
}
