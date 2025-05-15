import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';

export class RedisAdapter extends IoAdapter {
  async createIOServer(port: number, options?: ServerOptions): Promise<any> {
    const server = super.createIOServer(port, options);
    
    const publicClient = createClient({ url: 'redis://localhost:6379' });
    const subClient = publicClient.duplicate();

    await publicClient.connect();
    await subClient.connect();
    server.adapter({
      pubClient: publicClient,
      subClient: subClient,
    });
    return server;
  }
}
