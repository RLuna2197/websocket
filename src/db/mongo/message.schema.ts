import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop() 
  room: string;
  @Prop() 
  sender: string;
  @Prop() 
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);