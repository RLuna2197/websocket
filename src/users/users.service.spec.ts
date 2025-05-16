import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when username exists', async () => {
      const user = await service.findOne('luna');
      expect(user).toEqual({
        userId: 1,
        username: 'luna',
        password: 'admin',
      });
    });

    it('should return undefined when username does not exist', async () => {
      const user = await service.findOne('unknown');
      expect(user).toBeUndefined();
    });
  });
});
