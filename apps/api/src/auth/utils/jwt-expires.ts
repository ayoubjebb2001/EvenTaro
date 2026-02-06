import type { JwtSignOptions } from '@nestjs/jwt';

export const resolveExpiresIn = (
  value: string | undefined,
  fallback: JwtSignOptions['expiresIn'],
): JwtSignOptions['expiresIn'] => {
  if (!value) {
    return fallback;
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && value.trim() !== '') {
    return numeric;
  }

  return value as JwtSignOptions['expiresIn'];
};
