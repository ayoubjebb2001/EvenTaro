import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus, ReservationStatus } from '../generated/prisma/enums';

const mockEvent = {
  id: 'ev-1',
  title: 'Event',
  description: 'D',
  dateTime: new Date(Date.now() + 86400000 * 3),
  location: 'Paris',
  maxCapacity: 2,
  status: EventStatus.PUBLISHED,
  createdAt: new Date(),
};

const mockReservation = {
  id: 'res-1',
  userId: 'user-1',
  eventId: 'ev-1',
  status: ReservationStatus.PENDING,
  createdAt: new Date(),
  event: mockEvent,
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: {
            event: { findUnique: jest.fn() },
            reservation: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            user: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw when event is not published', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue({
        ...mockEvent,
        status: EventStatus.DRAFT,
      });

      await expect(
        service.create('user-1', { eventId: 'ev-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when event is full', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.reservation.count as jest.Mock).mockResolvedValue(2);

      await expect(
        service.create('user-1', { eventId: 'ev-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when user already has a reservation', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.reservation.count as jest.Mock).mockResolvedValue(0);
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(
        mockReservation,
      );

      await expect(
        service.create('user-1', { eventId: 'ev-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create reservation when rules are met', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.reservation.count as jest.Mock).mockResolvedValue(0);
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.reservation.create as jest.Mock).mockResolvedValue({
        ...mockReservation,
        event: {
          id: mockEvent.id,
          title: mockEvent.title,
          dateTime: mockEvent.dateTime,
          location: mockEvent.location,
        },
      });

      const result = await service.create('user-1', { eventId: 'ev-1' });

      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', eventId: 'ev-1' },
        include: expect.any(Object),
      });
      expect(result.eventId).toBe('ev-1');
    });
  });

  describe('cancelByUser', () => {
    it('should throw when reservation is not confirmed', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.PENDING,
        event: mockEvent,
      });

      await expect(service.cancelByUser('res-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when less than 48h before event', async () => {
      const soonEvent = {
        ...mockEvent,
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
        event: soonEvent,
      });

      await expect(service.cancelByUser('res-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when not the reservation owner', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
        event: mockEvent,
      });

      await expect(service.cancelByUser('res-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('confirm', () => {
    it('should throw when reservation is not PENDING', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
        event: mockEvent,
      });

      await expect(service.confirm('res-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
