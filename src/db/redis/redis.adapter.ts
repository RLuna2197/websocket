import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  async connectToRedis() {
    // Crea un cliente Redis para la publicación y suscripción
    // y otro cliente para la suscripción.
    // El cliente de publicación y suscripción se conecta al mismo servidor Redis.
    const pubClient = createClient({ url: 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();
    // Maneja errores de conexión
    this.ioServer?.adapter(createAdapter(pubClient, subClient));
  }

  // Método para crear el servidor
  // y conectar a Redis.
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    this.ioServer = server;
    return server;
  }

  private ioServer: any;
}
