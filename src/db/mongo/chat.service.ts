import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
    constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

    // This method saves a message to the database
    async saveMessage(message: Message): Promise<Message> {
        const newMessage = new this.messageModel(message);
        return await newMessage.save();
    }

    // obtener rooms from the database
    async getRooms(): Promise<string[]> {
        // Este método obtiene una lista de todas las "rooms" activas
        // en la base de datos. Utiliza el método distinct para obtener
        // una lista única de "rooms" de los mensajes almacenados.
        const rooms = await this.messageModel.distinct('room').exec();
        console.log(rooms);
        return rooms;
    }
    // This method retrieves the last 50 messages from a specific room
    // sorted by creation date in descending order
    async getMessagesByRoom(room: string): Promise<Message[]> {
        
        return await this.messageModel.find({ room }).sort({ createdAt: -1 }).limit(50).exec();
    }
}
