import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from 'src/db/mongo/chat.service';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Message } from 'src/db/mongo/message.schema';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let jwtService: JwtService;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    const mockChatService = {
      getRooms: jest.fn(),
      getMessagesByRoom: jest.fn(),
      saveMessage: jest.fn(),
    };

    const mockJwtService = {
      verify: jest.fn(),
    };

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    jwtService = module.get<JwtService>(JwtService);

    // Inyectamos un servidor simulado
    (gateway as any).server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should verify token and store user in client data', () => {
      const client = {
        handshake: { auth: { token: 'valid.token' } },
        data: {},
        disconnect: jest.fn(),
      } as unknown as Socket;

      (jwtService.verify as jest.Mock).mockReturnValue({ email: 'test@example.com' });

      gateway.handleConnection(client);

      expect(jwtService.verify).toHaveBeenCalledWith('valid.token');
      expect(client.data.user.email).toBe('test@example.com');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client if token is invalid', () => {
      const client = {
        handshake: { auth: { token: 'bad.token' } },
        data: {},
        disconnect: jest.fn(),
      } as unknown as Socket;

      (jwtService.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleGetRooms', () => {
    it('should emit filtered rooms excluding "default"', async () => {
      const client = {
        emit: jest.fn(),
      } as unknown as Socket;

      (chatService.getRooms as jest.Mock).mockResolvedValue(['default', 'room1', 'room2']);

      await gateway.handleGetRooms(client);

      expect(chatService.getRooms).toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('roomList', ['room1', 'room2']);
    });
  });

  describe('handleJoinRoom', () => {
    it('should join room and send history', async () => {
      const client = {
        join: jest.fn(),
        emit: jest.fn(),
      } as unknown as Socket;

      (chatService.getMessagesByRoom as jest.Mock).mockResolvedValue([{ text: 'hello' }]);

      await gateway.handleJoinRoom('room1', client);

      expect(client.join).toHaveBeenCalledWith('room1');
      expect(chatService.getMessagesByRoom).toHaveBeenCalledWith('room1');
      expect(client.emit).toHaveBeenCalledWith('history', [{ text: 'hello' }]);
    });
  });

  describe('handleMessage', () => {
    it('should save message and emit to room', async () => {
      const message = { room: 'room1', sender: 'user1', text: 'test', timestamp: new Date().toISOString() } as Partial<Message> as Message;

      const client = {} as Socket; // no usamos métodos de client aquí

      (chatService.saveMessage as jest.Mock).mockResolvedValue(undefined);

      await gateway.handleMessage(message, client);

      expect(chatService.saveMessage).toHaveBeenCalledWith(message);
      expect(mockServer.to).toHaveBeenCalledWith('room1');
      expect(mockServer.emit).toHaveBeenCalledWith('newMessage', message);
    });
  });
});
