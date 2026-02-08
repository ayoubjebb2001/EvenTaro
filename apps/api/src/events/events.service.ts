import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { EventStatus, ReservationStatus } from '../generated/prisma/enums';
import type { EventModel } from '../generated/prisma/models/Event';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveReservationCounts(
    eventIds: string[],
  ): Promise<Map<string, number>> {
    if (eventIds.length === 0) return new Map();
    const counts = await this.prisma.reservation.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
      _count: { id: true },
    });
    const map = new Map<string, number>();
    for (const c of counts) map.set(c.eventId, c._count.id);
    return map;
  }

  async findPublished(): Promise<EventResponseDto[]> {
    const events = await this.prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED },
      orderBy: { dateTime: 'asc' },
    });
    const countMap = await this.getActiveReservationCounts(events.map((e) => e.id));
    return events.map((e) =>
      this.toResponse(e, countMap.get(e.id) ?? 0),
    );
  }

  async findAll(): Promise<EventResponseDto[]> {
    const events = await this.prisma.event.findMany({
      orderBy: { dateTime: 'asc' },
    });
    const countMap = await this.getActiveReservationCounts(events.map((e) => e.id));
    return events.map((e) =>
      this.toResponse(e, countMap.get(e.id) ?? 0),
    );
  }

  async findUpcoming(): Promise<EventResponseDto[]> {
    const events = await this.prisma.event.findMany({
      where: { dateTime: { gte: new Date() } },
      orderBy: { dateTime: 'asc' },
    });
    const countMap = await this.getActiveReservationCounts(events.map((e) => e.id));
    return events.map((e) =>
      this.toResponse(e, countMap.get(e.id) ?? 0),
    );
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const countMap = await this.getActiveReservationCounts([id]);
    return this.toResponse(event, countMap.get(id) ?? 0);
  }

  async findOnePublished(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findFirst({
      where: { id, status: EventStatus.PUBLISHED },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const countMap = await this.getActiveReservationCounts([id]);
    return this.toResponse(event, countMap.get(id) ?? 0);
  }

  async create(dto: CreateEventDto): Promise<EventResponseDto> {
    const dateTime = new Date(dto.dateTime);
    if (dateTime.getTime() < Date.now()) {
      throw new BadRequestException('Event date must be in the future');
    }
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        dateTime,
        location: dto.location,
        maxCapacity: dto.maxCapacity,
        status: EventStatus.DRAFT,
      },
    });
    return this.toResponse(event, 0);
  }

  async update(id: string, dto: UpdateEventDto): Promise<EventResponseDto> {
    await this.getOrThrow(id);
    if (dto.dateTime) {
      const dateTime = new Date(dto.dateTime);
      if (dateTime.getTime() < Date.now()) {
        throw new BadRequestException('Event date must be in the future');
      }
    }
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.dateTime !== undefined && { dateTime: new Date(dto.dateTime) }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.maxCapacity !== undefined && { maxCapacity: dto.maxCapacity }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
    const countMap = await this.getActiveReservationCounts([id]);
    return this.toResponse(event, countMap.get(id) ?? 0);
  }

  async remove(id: string): Promise<void> {
    const event = await this.getOrThrow(id);
    if (event.status === EventStatus.PUBLISHED) {
      await this.prisma.event.update({
        where: { id },
        data: { status: EventStatus.CANCELLED },
      });
    } else {
      await this.prisma.event.delete({ where: { id } });
    }
  }

  async getStats(id: string): Promise<{
    eventId: string;
    maxCapacity: number;
    reservedCount: number;
    fillRatePercent: number;
  }> {
    const event = await this.getOrThrow(id);
    const countMap = await this.getActiveReservationCounts([id]);
    const reservedCount = countMap.get(id) ?? 0;
    const fillRatePercent =
      event.maxCapacity > 0
        ? Math.round((reservedCount / event.maxCapacity) * 100)
        : 0;
    return {
      eventId: id,
      maxCapacity: event.maxCapacity,
      reservedCount,
      fillRatePercent,
    };
  }

  async getOrThrow(id: string): Promise<EventModel> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private toResponse(event: EventModel, activeCount: number): EventResponseDto {
    const placesLeft = Math.max(0, event.maxCapacity - activeCount);
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      maxCapacity: event.maxCapacity,
      status: event.status as EventStatus,
      createdAt: event.createdAt,
      placesLeft,
    };
  }
}
