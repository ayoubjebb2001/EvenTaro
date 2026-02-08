import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AppRole } from './constants/roles';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockUser = {
  id: 'user-1',
  fullName: 'Test User',
  email: 'test@example.com',
  password: 'hashed',
  role: AppRole.USER,
  createdAt: new Date(),
  hashedRefreshToken: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            setHashedRefreshToken: jest.fn(),
            toResponseDto: jest.fn((u) => ({
              id: u.id,
              fullName: u.fullName,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt,
            })),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const dto: RegisterDto = {
        fullName: 'Test',
        email: 'new@example.com',
        password: 'password123',
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as never);

      const result = await service.register(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: dto.fullName,
          email: dto.email,
          role: AppRole.USER,
        }),
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'token');
      expect(result).toHaveProperty('refreshToken', 'token');
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto: RegisterDto = {
        fullName: 'Test',
        email: 'existing@example.com',
        password: 'password123',
      };
      usersService.findByEmail.mockResolvedValue(mockUser as never);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      usersService.findByEmail.mockResolvedValue(mockUser as never);

      const result = await service.login(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'none@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      usersService.findById.mockResolvedValue(mockUser as never);
      usersService.toResponseDto.mockReturnValue({
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
      });

      const result = await service.getProfile('user-1');

      expect(usersService.findById).toHaveBeenCalledWith('user-1');
      expect(result).toMatchObject({
        id: 'user-1',
        fullName: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getProfile('missing')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      await service.logout('user-1');
      expect(usersService.setHashedRefreshToken).toHaveBeenCalledWith(
        'user-1',
        null,
      );
    });
  });
});
