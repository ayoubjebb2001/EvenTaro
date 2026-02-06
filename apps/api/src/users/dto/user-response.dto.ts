import type { AppRole } from '../../auth/constants/roles';

export class UserResponseDto {
  id!: string;
  email!: string;
  role!: AppRole;
  createdAt!: Date;
}
