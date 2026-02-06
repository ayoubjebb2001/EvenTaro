export const AppRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];
