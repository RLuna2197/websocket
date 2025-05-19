import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return a JWT token if credentials are valid', async () => {
    const mockUser = {
      userId: 1,
      username: 'john',
      password: 'secret',
    };

    (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('mocked.token');

    const result = await authService.signIn('john', 'secret');

    expect(usersService.findOne).toHaveBeenCalledWith('john');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 1,
      username: 'john',
    });
    expect(result).toEqual({ access_token: 'mocked.token' });
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const mockUser = {
      userId: 1,
      username: 'john',
      password: 'secret',
    };

    (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

    await expect(authService.signIn('john', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    (usersService.findOne as jest.Mock).mockResolvedValue(undefined);

    await expect(authService.signIn('john', 'secret')).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
