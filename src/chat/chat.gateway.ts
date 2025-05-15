import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "src/db/mongo/chat.service";
import { Message } from "src/db/mongo/message.schema";

@WebSocketGateway({ cors: {origin: '*' } })
export class ChatGateway {
    // This is a WebSocket gateway for handling chat messages
    // It uses the @WebSocketGateway decorator from NestJS
    // to create a WebSocket server that listens for incoming connections
    // and broadcasts messages to all connected clients.

    constructor(private readonly chatService: ChatService) {}

    @WebSocketServer()
    server: Server;

    // This method is called when a new client connects to the WebSocket server
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        client.join(room);
        const history = await this.chatService.getMessagesByRoom(room);
        client.emit('history', history);
    }

    @SubscribeMessage('message')
    async handleMessage(
        @MessageBody() data: Message, 
        @ConnectedSocket() client: Socket
    ) {
        await this.chatService.saveMessage(data);
        this.server.to(data.room).emit('message', data);
    }
}