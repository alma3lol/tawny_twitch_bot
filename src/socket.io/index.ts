import { Server } from 'socket.io';

export class SocketIOServer {
  private constructor() {}
  private static server: Server | null = null;
  static getServer = () => {
    if (this.server !== null) return this.server;
    console.log('HERE');
    console.log(this.server);
    this.server = new Server(4000, { cors: { origin: '*' } });

    // TODO: REMOVE THIS BEFORE COMMITTING
    this.server.on('connection', (socket) => {
      console.log(`Someone connected: ${socket.id}`);
      socket.emit('fuck off bruuuh');
      socket.on('disconnect', () => {
        console.log(`Someone left: ${socket.id}`);
      });
    });
    return this.server;
  };
}
