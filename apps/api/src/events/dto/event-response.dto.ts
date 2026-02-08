import { EventStatus } from '../../generated/prisma/enums';

export class EventResponseDto {
  id!: string;
  title!: string;
  description!: string;
  dateTime!: Date;
  location!: string;
  maxCapacity!: number;
  status!: EventStatus;
  createdAt!: Date;
  placesLeft?: number;
}
