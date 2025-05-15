import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisAdapter } from './db/redis/redis.adapter';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(
    new RedisAdapter(app)
  );
  app.enableCors(); // CORS
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault('America/El_Salvador'); // Setting the default timezone

  
  await app.listen(process.env.PORT || 3000, () => {
    console.log(`http://localhost:${process.env.PORT || 3000}`);
  }); // PORT
}
bootstrap();
