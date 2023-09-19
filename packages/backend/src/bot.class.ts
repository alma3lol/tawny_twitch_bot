import { Client } from 'tmi.js';
import { PrismaService } from './app.service';
import { BotSubject } from './subjects';

export class Bot {
  private static botSubject: BotSubject | null = null;
  static getBot = async (
    access_token: string,
    prismaService: PrismaService,
  ) => {
    if (this.botSubject !== null) return this.botSubject;
    const client = new Client({
      options: { debug: true },
      identity: {
        username: process.env.BOT_USERNAME,
        password: access_token,
      },
      channels: process.env.CHANNEL.split(','),
    });

    client.connect();

    this.botSubject = new BotSubject(client, prismaService);
    return this.botSubject;
  };
  static isBotInitiated = () => this.botSubject !== null;
  static getBotOrNull = () => this.botSubject;
}
