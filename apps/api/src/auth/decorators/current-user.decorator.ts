import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<{ user: User }>();
    if (!data) {
      return user;
    }
    return user?.[data];
  },
);
