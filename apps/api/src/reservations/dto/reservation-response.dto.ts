import { ReservationStatus } from '../../generated/prisma/enums';

export class ReservationEventSummaryDto {
  id!: string;
  title!: string;
  dateTime!: Date;
  location!: string;
}

export class ReservationResponseDto {
  id!: string;
  userId!: string;
  eventId!: string;
  status!: ReservationStatus;
  createdAt!: Date;
  event?: ReservationEventSummaryDto;
  user?: { id: string; fullName: string; email: string };
}
