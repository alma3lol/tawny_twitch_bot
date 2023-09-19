import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as _ from 'lodash';
import { Server, Socket } from 'socket.io';
import { Bot } from 'src/bot.class';
// dummy change

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  private botSubjectSubscribedClient: string[] = [];
  handleConnection = (client: Socket) => {
    this.handleIsBotConnected(client);
  };

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('isBotConnected')
  handleIsBotConnected(client: Socket) {
    client.emit('isBotConnected', Bot.isBotInitiated());
    if (!!_.find(this.botSubjectSubscribedClient, client.id)) return;
    const botSubject = Bot.getBotOrNull();
    if (botSubject === null) return;
    this.botSubjectSubscribedClient.push(client.id);
    botSubject.subscribe((event) => {
      const { type, ...rest } = event;
      switch (type) {
        case 'BOT_CONNECTED':
          client.emit('isBotConnected', event.connected);
          break;
        case 'CHAT_MESSAGE':
          client.emit('chat', rest);
          break;
        case 'USER_JOINED':
          client.emit('USER_JOINED', rest);
          break;
        case 'USER_LEFT':
          client.emit('USER_LEFT', rest);
          break;
        case 'BOT_JOINED':
          client.emit('BOT_JOINED', event.channel);
          break;
        case 'BOT_LEFT':
          client.emit('BOT_LEFT', event.channel);
          break;
        case 'BOT_MOD':
          client.emit('BOT_MOD', event.channel, event.mod);
          break;
      }
    });
    botSubject.next({ type: 'BOT_CHANNELS' });
  }

  @SubscribeMessage('cmd')
  async handleCmd(client: Socket, payload: { cmd: string; args: string[] }) {
    console.log('cmd', { client, payload });
    const botSubject = Bot.getBotOrNull();
    if (botSubject === null) return;
    switch (payload.cmd) {
      case 'join':
        try {
          await botSubject.client.join(payload.args[0]);
          return true;
        } catch (_e) {
          return false;
        }
      case 'leave':
        try {
          await botSubject.client.part(payload.args[0]);
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
        break;
    }
  }
}
