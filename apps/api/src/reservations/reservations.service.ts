import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { StreamableFile } from '@nestjs/common/file-stream/streamable-file';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { EventStatus, ReservationStatus } from '../generated/prisma/enums';
import type { ReservationModel } from '../generated/prisma/models/Reservation';
import type { EventModel } from '../generated/prisma/models/Event';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

const HOURS_BEFORE_EVENT_TO_CANCEL = 48;

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      include: { _count: { select: { reservations: true } } },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not available for reservation');
    }

    const activeReservationCount = await this.prisma.reservation.count({
      where: {
        eventId: event.id,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });
    if (activeReservationCount >= event.maxCapacity) {
      throw new BadRequestException('Event is full');
    }

    const existing = await this.prisma.reservation.findFirst({
      where: {
        userId,
        eventId: event.id,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'You already have a reservation for this event',
      );
    }

    const reservation = await this.prisma.reservation.create({
      data: { userId, eventId: event.id },
      include: {
        event: {
          select: { id: true, title: true, dateTime: true, location: true },
        },
      },
    });
    return this.toResponse(reservation);
  }

  async getStatsByStatus(): Promise<{
    PENDING: number;
    CONFIRMED: number;
    REFUSED: number;
    CANCELLED: number;
  }> {
    const counts = await this.prisma.reservation.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const map = new Map<string, number>();
    for (const c of counts) map.set(c.status, c._count.id);
    return {
      PENDING: map.get(ReservationStatus.PENDING) ?? 0,
      CONFIRMED: map.get(ReservationStatus.CONFIRMED) ?? 0,
      REFUSED: map.get(ReservationStatus.REFUSED) ?? 0,
      CANCELLED: map.get(ReservationStatus.CANCELLED) ?? 0,
    };
  }

  async findAll(): Promise<ReservationResponseDto[]> {
    const list = await this.prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: { id: true, title: true, dateTime: true, location: true },
        },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
    return list.map((r) => this.toResponse(r));
  }

  async findMy(userId: string): Promise<ReservationResponseDto[]> {
    const list = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: { id: true, title: true, dateTime: true, location: true },
        },
      },
    });
    return list.map((r) => this.toResponse(r));
  }

  async findOne(id: string): Promise<ReservationModel & { event: EventModel }> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation as ReservationModel & { event: EventModel };
  }

  async confirm(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.findOne(id);
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending reservations can be confirmed',
      );
    }
    const event = await this.prisma.event.findUnique({
      where: { id: reservation.eventId },
      include: { _count: { select: { reservations: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    const confirmedCount = await this.prisma.reservation.count({
      where: {
        eventId: event.id,
        status: ReservationStatus.CONFIRMED,
      },
    });
    if (confirmedCount >= event.maxCapacity) {
      throw new BadRequestException('Event capacity would be exceeded');
    }
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CONFIRMED },
      include: {
        event: {
          select: { id: true, title: true, dateTime: true, location: true },
        },
      },
    });
    return this.toResponse(updated);
  }

  async refuse(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.findOne(id);
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be refused');
    }
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.REFUSED },
      include: {
        event: {
          select: { id: true, title: true, dateTime: true, location: true },
        },
      },
    });
    return this.toResponse(updated);
  }

  async cancelByAdmin(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.findOne(id);
    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException('Reservation cannot be cancelled');
    }
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        event: {
          select: { id: true, title: true, dateTime: true, location: true },
        },
      },
    });
    return this.toResponse(updated);
  }

  async cancelByUser(
    id: string,
    userId: string,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.findOne(id);
    if (reservation.userId !== userId) {
      throw new ForbiddenException('Not your reservation');
    }
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only confirmed reservations can be cancelled by user',
      );
    }
    const eventDate = new Date(reservation.event.dateTime);
    const cutoff = new Date(
      eventDate.getTime() - HOURS_BEFORE_EVENT_TO_CANCEL * 60 * 60 * 1000,
    );
    if (new Date() > cutoff) {
      throw new BadRequestException(
        `Cancellation is only allowed at least ${HOURS_BEFORE_EVENT_TO_CANCEL}h before the event`,
      );
    }
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        event: {
          select: { id: true, title: true, dateTime: true, location: true },
        },
      },
    });
    return this.toResponse(updated);
  }

  async getTicket(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<StreamableFile> {
    const reservation = await this.findOne(id);
    if (reservation.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Not allowed to download this ticket');
    }
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Ticket is only available for confirmed reservations',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: reservation.userId },
    });
    const buffer = await this.generateTicketPdf(
      reservation,
      user?.fullName ?? 'Participant',
    );
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="ticket.pdf"',
    });
  }

  private async generateTicketPdf(
    reservation: ReservationModel & { event: EventModel },
    participantName: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A5', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk?: Buffer) => chunk && chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Event Ticket', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Event: ${reservation.event.title}`);
      doc.text(
        `Date: ${new Date(reservation.event.dateTime).toLocaleString()}`,
      );
      doc.text(`Location: ${reservation.event.location}`);
      doc.moveDown();
      doc.text(`Participant: ${participantName}`);
      doc.text(`Reservation ID: ${reservation.id}`);
      doc.end();
    });
  }

  private toResponse(
    r: ReservationModel & {
      event?: { id: string; title: string; dateTime: Date; location: string };
      user?: { id: string; fullName: string; email: string };
    },
  ): ReservationResponseDto {
    return {
      id: r.id,
      userId: r.userId,
      eventId: r.eventId,
      status: r.status,
      createdAt: r.createdAt,
      event: r.event
        ? {
            id: r.event.id,
            title: r.event.title,
            dateTime: r.event.dateTime,
            location: r.event.location,
          }
        : undefined,
      user: r.user,
    };
  }
}
