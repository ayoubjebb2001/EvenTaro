import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AppRole } from '../auth/constants/roles';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(AppRole.USER, AppRole.ADMIN)
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.create(userId, dto);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  findAll(): Promise<ReservationResponseDto[]> {
    return this.reservationsService.findAll();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  getStats(): Promise<{
    PENDING: number;
    CONFIRMED: number;
    REFUSED: number;
    CANCELLED: number;
  }> {
    return this.reservationsService.getStatsByStatus();
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(AppRole.USER, AppRole.ADMIN)
  findMy(@CurrentUser('sub') userId: string): Promise<ReservationResponseDto[]> {
    return this.reservationsService.findMy(userId);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  confirm(@Param('id') id: string): Promise<ReservationResponseDto> {
    return this.reservationsService.confirm(id);
  }

  @Patch(':id/refuse')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
  refuse(@Param('id') id: string): Promise<ReservationResponseDto> {
    return this.reservationsService.refuse(id);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.USER)
  async cancel(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ): Promise<ReservationResponseDto> {
    if (role === AppRole.ADMIN) {
      return this.reservationsService.cancelByAdmin(id);
    }
    return this.reservationsService.cancelByUser(id, userId);
  }

  @Get(':id/ticket')
  @UseGuards(RolesGuard)
  @Roles(AppRole.USER, AppRole.ADMIN)
  async getTicket(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isAdmin = role === AppRole.ADMIN;
    return this.reservationsService.getTicket(id, userId, isAdmin);
  }
}
