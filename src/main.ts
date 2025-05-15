import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './db/redis/redis.adapter';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);

  
  app.enableCors({
    origin: '*',  // o el dominio que uses en frontend
    methods: ['GET', 'POST'],
  }); // CORS
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault('America/El_Salvador'); // Setting the default timezone

  
  await app.listen(process.env.PORT || 3000, () => {
    console.log(`http://localhost:${process.env.PORT || 3000}`);
  }); // PORT
}
bootstrap();
