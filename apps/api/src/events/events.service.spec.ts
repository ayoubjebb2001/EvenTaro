import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '../generated/prisma/enums';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const mockEvent = {
  id: 'ev-1',
  title: 'Test Event',
  description: 'Desc',
  dateTime: new Date(Date.now() + 86400000),
  location: 'Paris',
  maxCapacity: 10,
  status: EventStatus.PUBLISHED,
  createdAt: new Date(),
};

describe('EventsService', () => {
  let service: EventsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            reservation: {
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create event in DRAFT', async () => {
      const dto: CreateEventDto = {
        title: 'New Event',
        description: 'D',
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        location: 'Lyon',
        maxCapacity: 5,
      };
      (prisma.event.create as jest.Mock).mockResolvedValue({
        ...mockEvent,
        ...dto,
        status: EventStatus.DRAFT,
      });
      (prisma.reservation.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await service.create(dto);

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: dto.title,
          status: EventStatus.DRAFT,
        }),
      });
      expect(result.status).toBe(EventStatus.DRAFT);
    });

    it('should throw when dateTime is in the past', async () => {
      const dto: CreateEventDto = {
        title: 'Past',
        description: 'D',
        dateTime: new Date(Date.now() - 86400000).toISOString(),
        location: 'L',
        maxCapacity: 5,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.event.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return event with placesLeft', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.reservation.groupBy as jest.Mock).mockResolvedValue([
        { eventId: mockEvent.id, _count: { id: 3 } },
      ]);

      const result = await service.findOne('ev-1');

      expect(result.id).toBe('ev-1');
      expect(result.placesLeft).toBe(7);
    });

    it('should throw NotFound when event does not exist', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should throw when dateTime is in the past', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      const dto: UpdateEventDto = {
        dateTime: new Date(Date.now() - 86400000).toISOString(),
      };

      await expect(service.update('ev-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
