// chat.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';

const mockMessage = {
    room: 'general',
    sender: 'user1',
    text: 'Hello world',
};

describe('ChatService', () => {
  let service: ChatService;
  let model: Model<Message>;

  const messageModelMock = jest.fn().mockImplementation((msg) => ({
    ...msg,
    save: jest.fn().mockResolvedValue(msg),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken('Message'),
          useValue: messageModelMock,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    model = module.get<Model<Message>>(getModelToken('Message'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save a message', async () => {
    const result = await service.saveMessage(mockMessage as Message);
    expect(result).toEqual(mockMessage);
  });

});
