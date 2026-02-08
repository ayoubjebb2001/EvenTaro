import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppRole } from '../src/auth/constants/roles';
import { EventStatus, ReservationStatus } from '../src/generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Events and Reservations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminAccessToken: string;
  let userAccessToken: string;
  let eventId: string;
  let reservationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const admin = await prisma.user.upsert({
      where: { email: 'e2e-admin@test.com' },
      create: {
        fullName: 'E2E Admin',
        email: 'e2e-admin@test.com',
        password: hashedPassword,
        role: AppRole.ADMIN,
      },
      update: { password: hashedPassword, role: AppRole.ADMIN },
    });
    const user = await prisma.user.upsert({
      where: { email: 'e2e-user@test.com' },
      create: {
        fullName: 'E2E User',
        email: 'e2e-user@test.com',
        password: hashedPassword,
        role: AppRole.USER,
      },
      update: { password: hashedPassword, role: AppRole.USER },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: 'Password123!' });
    adminAccessToken = adminLogin.body.accessToken;

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'Password123!' });
    userAccessToken = userLogin.body.accessToken;
  }, 30000);

  afterAll(async () => {
    if (reservationId) {
      await prisma.reservation
        .deleteMany({ where: { id: reservationId } })
        .catch(() => {});
    }
    if (eventId) {
      await prisma.event.deleteMany({ where: { id: eventId } }).catch(() => {});
    }
    await app?.close();
  });

  it('admin creates draft event', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 7);
    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        title: 'E2E Event',
        description: 'Description',
        dateTime: futureDate.toISOString(),
        location: 'Paris',
        maxCapacity: 5,
      })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe(EventStatus.DRAFT);
    eventId = res.body.id;
  });

  it('public cannot see draft event in published list', async () => {
    const res = await request(app.getHttpServer())
      .get('/events/published')
      .expect(200);
    const found =
      Array.isArray(res.body) &&
      res.body.some((e: { id: string }) => e.id === eventId);
    expect(found).toBe(false);
  });

  it('admin updates event to published', async () => {
    await request(app.getHttpServer())
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: EventStatus.PUBLISHED })
      .expect(200);
  });

  it('public sees published event', async () => {
    const res = await request(app.getHttpServer())
      .get('/events/published')
      .expect(200);
    const found =
      Array.isArray(res.body) &&
      res.body.find((e: { id: string }) => e.id === eventId);
    expect(found).toBeDefined();
    expect(found.placesLeft).toBe(5);
  });

  it('user creates reservation', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ eventId })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe(ReservationStatus.PENDING);
    reservationId = res.body.id;
  });

  it('user cannot download ticket for pending reservation', async () => {
    await request(app.getHttpServer())
      .get(`/reservations/${reservationId}/ticket`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(400);
  });

  it('admin confirms reservation', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/reservations/${reservationId}/confirm`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(res.body.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('user downloads ticket', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservations/${reservationId}/ticket`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it('user sees reservation in my list', async () => {
    const res = await request(app.getHttpServer())
      .get('/reservations/my')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);
    const found =
      Array.isArray(res.body) &&
      res.body.find((r: { id: string }) => r.id === reservationId);
    expect(found).toBeDefined();
    expect(found.status).toBe(ReservationStatus.CONFIRMED);
  });
});
