import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  async connectToRedis() {
    const pubClient = createClient({ url: 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();
    this.ioServer?.adapter(createAdapter(pubClient, subClient));
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    this.ioServer = server;
    return server;
  }

  private ioServer: any;
}
