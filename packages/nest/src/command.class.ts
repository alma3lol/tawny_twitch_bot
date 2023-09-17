import { ChatUserstate, Client } from 'tmi.js';
import { PrismaService } from './app.service';
import { ChannelSubject } from './subjects';

export abstract class Command {
  constructor(
    protected readonly client: Client,
    protected readonly prismaService: PrismaService,
    protected readonly args: string[],
    protected readonly channelSubject: ChannelSubject,
    protected readonly user: ChatUserstate,
  ) {}
  abstract Command(): void;
}
