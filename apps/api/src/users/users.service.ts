import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { Prisma } from '../generated/prisma/client';
import type { UserModel } from '../generated/prisma/models/User';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput): Promise<UserModel> {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async setHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  toResponseDto(user: UserModel): UserResponseDto {
    const { id, fullName, email, role, createdAt } = user;
    return { id, fullName, email, role, createdAt };
  }
}
