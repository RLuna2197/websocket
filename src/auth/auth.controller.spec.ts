import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginDto } from '../interfaces/login.interface';
import { AuthService } from './auth.service';


describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      signIn: jest.fn().mockResolvedValue({ access_token: 'test-token' }),
    };
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should return a token on successful login', async () => {
    const result = await controller.login({ username: 'luna', password: 'admin' });
    expect(result).toEqual({ access_token: 'test-token' });
    expect(authServiceMock.signIn).toHaveBeenCalledWith('luna', 'admin');
  });
});
