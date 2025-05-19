import { 
    ConnectedSocket, 
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody, 
    SubscribeMessage, 
    WebSocketGateway, 
    WebSocketServer } from "@nestjs/websockets";
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from "socket.io";
import { ChatService } from "../db/mongo/chat.service";
import { Message } from "../db/mongo/message.schema";

@WebSocketGateway({ 
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },  
    transports: ['websocket'],
 })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    // Esta es una puerta de enlace WebSocket para gestionar mensajes de chat.
    // Utiliza el decorador @WebSocketGateway de NestJS.
    // para crear un servidor WebSocket que escucha las conexiones entrantes.
    // y transmite mensajes a todos los clientes conectados.

    constructor(private readonly chatService: ChatService, private readonly jwtService: JwtService) {}
    afterInit(server: any) {
        console.log('WebSocket server initialized');
    }

    @WebSocketServer()
    server: Server;

   async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token); // Verifica y decodifica el token
      client.data.user = payload;
      console.log(`Cliente conectado: ${payload.username || payload.sub}`);
    } catch (err) {
      console.error('Token inválido:', err.message);
      client.disconnect(); // desconectar si el token no es válido
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('Cliente desconectado');
  }
  
   // Emitir rooms activas al cliente
  @SubscribeMessage('rooms')
  async handleGetRooms(@ConnectedSocket() client: Socket) {
    const rooms = await this.chatService.getRooms();
    // rooms es un array de strings con el nombre de las rooms

    client.emit('roomList', rooms);
  }

  @SubscribeMessage('joinRoom')
    async handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        client.join(room);
        const history = await this.chatService.getMessagesByRoom(room);
        client.emit('history', history);
    }

  // This method is called when a client sends a message
  @SubscribeMessage('sendMessage')
  async handleMessage(
      @MessageBody() data: Message, 
      @ConnectedSocket() client: Socket
  ) {
      await this.chatService.saveMessage(data);
      this.server.to(data.room).emit('newMessage', data);
  }
}