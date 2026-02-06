import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppRole } from './constants/roles';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import type { JwtRefreshPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.USER, AppRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@CurrentUser('sub') userId: string): Promise<void> {
    await this.authService.logout(userId);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  refresh(@CurrentUser() user: JwtRefreshPayload): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.USER, AppRole.ADMIN)
  @Get('me')
  me(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }
}
