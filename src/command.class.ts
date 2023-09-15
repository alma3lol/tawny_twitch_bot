import { ChatUserstate, Client } from 'tmi.js';
import { PrismaService } from './app.service';

export abstract class Command {
  constructor(
    protected readonly client: Client,
    protected readonly prismaService: PrismaService,
    protected readonly args: string[],
    protected readonly channel: string,
    protected readonly user: ChatUserstate,
  ) {}
  abstract Command(): void;
}
