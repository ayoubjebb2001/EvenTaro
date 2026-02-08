const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  maxCapacity: number;
  status: string;
  createdAt: string;
  placesLeft?: number;
}

export interface ReservationResponse {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    dateTime: string;
    location: string;
  };
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('eventaro_refresh', refresh);
  }
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('eventaro_refresh');
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('eventaro_refresh');
}

async function refreshAccessToken(): Promise<AuthResponse | null> {
  const stored = getStoredRefreshToken();
  if (!stored) return null;
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'GET',
    credentials: 'include',
    headers: { Authorization: `Bearer ${stored}` },
  });
  if (!res.ok) return null;
  const data: AuthResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }
  let res = await fetch(url, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed && getAccessToken()) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${getAccessToken()}`;
      res = await fetch(url, { ...options, headers, credentials: 'include' });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface CreateEventDto {
  title: string;
  description: string;
  dateTime: string;
  location: string;
  maxCapacity: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (fullName: string, email: string, password: string) =>
      apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
      }),
    logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
    me: () => apiRequest<User>('/auth/me'),
  },
  events: {
    getPublished: () => apiRequest<EventResponse[]>('/events/published'),
    getPublishedById: (id: string) =>
      apiRequest<EventResponse>(`/events/published/${id}`),
    getAll: () => apiRequest<EventResponse[]>('/events'),
    getUpcoming: () => apiRequest<EventResponse[]>('/events/upcoming'),
    getById: (id: string) => apiRequest<EventResponse>(`/events/${id}`),
    create: (dto: CreateEventDto) =>
      apiRequest<EventResponse>('/events', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    update: (id: string, dto: UpdateEventDto) =>
      apiRequest<EventResponse>(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/events/${id}`, { method: 'DELETE' }),
    getStats: (id: string) =>
      apiRequest<{ eventId: string; maxCapacity: number; reservedCount: number; fillRatePercent: number }>(
        `/events/${id}/stats`
      ),
  },
  reservations: {
    getMy: () => apiRequest<ReservationResponse[]>('/reservations/my'),
    getAll: () => apiRequest<ReservationResponse[]>('/reservations/all'),
    getStats: () =>
      apiRequest<{ PENDING: number; CONFIRMED: number; REFUSED: number; CANCELLED: number }>(
        '/reservations/stats'
      ),
    create: (eventId: string) =>
      apiRequest<ReservationResponse>('/reservations', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      }),
    cancel: (id: string) =>
      apiRequest<ReservationResponse>(`/reservations/${id}/cancel`, {
        method: 'PATCH',
      }),
    confirm: (id: string) =>
      apiRequest<ReservationResponse>(`/reservations/${id}/confirm`, {
        method: 'PATCH',
      }),
    refuse: (id: string) =>
      apiRequest<ReservationResponse>(`/reservations/${id}/refuse`, {
        method: 'PATCH',
      }),
    ticketUrl: (id: string) =>
      `${API_URL}/reservations/${id}/ticket`,
  },
};
