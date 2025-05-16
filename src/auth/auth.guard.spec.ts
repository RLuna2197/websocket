import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
    guard = new AuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access if token is valid', async () => {
      const mockPayload = { username: 'luna' };
      const token = 'valid.token.here';

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(mockPayload);

      const mockContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: `Bearer ${token}`,
            },
          }),
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
      };

      const result = await guard.canActivate(mockContext as ExecutionContext);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if no token', async () => {
      const mockContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
          }),
          getResponse: jest.fn().mockReturnValue({}),
          getNext: jest.fn().mockReturnValue({}),
        })),
      };

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'invalid.token';
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error('Invalid token'));

      const mockContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${token}`,
            },
          }),
          getResponse: () => ({}),
          getNext: () => ({}),
        }),
      };

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(UnauthorizedException);
    });
  });
});
