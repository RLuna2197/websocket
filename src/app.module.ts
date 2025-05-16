import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatService } from './db/mongo/chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat/chat.gateway';
import { Message, MessageSchema } from './db/mongo/message.schema';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGOOSE_HOST}:${process.env.MONGOOSE_PORT}/${process.env.MONGOSE_DATABASE}`,
    ),
    MongooseModule.forFeature([
      {
        // This is the name of the model that will be used to interact with the database
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    AuthModule,
    UsersModule,    

  ],
  controllers: [AppController],
  providers: [AppService, ChatService, ChatGateway],
})
export class AppModule {}
