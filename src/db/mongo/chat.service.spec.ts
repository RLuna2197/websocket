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

  const mockMessageModel = {
    new: jest.fn().mockResolvedValue(mockMessage),
    constructor: jest.fn().mockResolvedValue(mockMessage),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken('Message'),
          useValue: mockMessageModel,
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
    mockMessageModel.create.mockResolvedValue(mockMessage);
    const result = await service.saveMessage(mockMessage as Partial<Message> as Message);
    expect(result).toEqual(mockMessage);
    expect(mockMessageModel.create).toHaveBeenCalledWith(mockMessage);
  });

  it('should get message history', async () => {
    mockMessageModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockMessage]),
    });
    const result = await service.getMessagesByRoom('general');
    expect(result).toEqual([mockMessage]);
    expect(mockMessageModel.find).toHaveBeenCalledWith({ room: 'general' });
  });
});
