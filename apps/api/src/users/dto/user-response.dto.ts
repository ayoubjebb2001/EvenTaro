import { Role } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  email!: string;
  role!: Role;
  createdAt!: Date;
}
