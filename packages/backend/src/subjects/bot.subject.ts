import { Subject } from 'rxjs';
import { PrismaService } from '../app.service';
import { ChatUserstate, Client } from 'tmi.js';
import {
  AddCommand,
  EndCommand,
  StartCommand,
  HelloCommand,
  HelpCommand,
  MilkCommand,
} from '../commands';
import { Command } from '../command.class';
import { ChannelSubject } from './channel.subject';

export type BotConnected = {
  type: 'BOT_CONNECTED';
  connected: boolean;
};

export type ChatMessage = {
  type: 'CHAT_MESSAGE';
  channel: string;
  user: ChatUserstate;
  message: string;
};

export type UserJoined = {
  type: 'USER_JOINED';
  channel: string;
  username: string;
};

export type UserLeft = {
  type: 'USER_LEFT';
  channel: string;
  username: string;
};

export type BotJoined = {
  type: 'BOT_JOINED';
  channel: string;
};

export type BotLeft = {
  type: 'BOT_LEFT';
  channel: string;
};

export type BotChannels = {
  type: 'BOT_CHANNELS';
};

export type BotMod = {
  type: 'BOT_MOD';
  channel: string;
  mod: boolean;
};

export class BotSubject extends Subject<
  | BotConnected
  | ChatMessage
  | UserJoined
  | UserLeft
  | BotJoined
  | BotLeft
  | BotChannels
  | BotMod
> {
  private channels = new Map<string, ChannelSubject>();
  constructor(
    readonly client: Client,
    readonly prismaService: PrismaService,
  ) {
    super();
    this.subscribe((event) => {
      if (event.type !== 'BOT_CHANNELS') return;
      this.channels.forEach((channelSubject, channel) => {
        this.next({ type: 'BOT_JOINED', channel });
        this.next({ type: 'BOT_MOD', channel, mod: channelSubject.getMod() });
      });
    });
    this.client.on('connected', () =>
      this.next({ type: 'BOT_CONNECTED', connected: true }),
    );
    this.client.on('disconnected', () =>
      this.next({ type: 'BOT_CONNECTED', connected: false }),
    );
    this.client.on('chat', async (channel, user, message, self) => {
      this.next({ type: 'CHAT_MESSAGE', user, message, channel });
      if (self) return;
      if (user['message-type'] === 'chat' && message.startsWith('!')) {
        if (!this.channels.has(channel)) {
          this.channels.set(channel, new ChannelSubject(this.client, channel));
        }
        const channelSubject = this.channels.get(channel);
        const commandRegex = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
        const [, command, args_full] = message.trim().match(commandRegex);
        const args =
          args_full === '' || args_full == undefined
            ? []
            : args_full.split(' ');
        type CommandsObj = {
          [key: string]: new (
            client: Client,
            prismaService: PrismaService,
            args: string[],
            channelSubject: ChannelSubject,
            user: ChatUserstate,
          ) => Command;
        };
        const broadcasterCommands: CommandsObj = {
          add: AddCommand,
          end: EndCommand,
          start: StartCommand,
        };
        const generalCommands: CommandsObj = {
          help: HelpCommand,
          milk: MilkCommand,
          hello: HelloCommand,
        };
        const cmd = command.toLowerCase();
        if (
          cmd in broadcasterCommands &&
          user.badges !== null &&
          user.badges.broadcaster === '1'
        )
          new broadcasterCommands[cmd](
            this.client,
            this.prismaService,
            args,
            channelSubject,
            user,
          ).Command();
        if (cmd in generalCommands)
          new generalCommands[cmd](
            this.client,
            this.prismaService,
            args,
            channelSubject,
            user,
          ).Command();
      }
    });
    this.client.on('join', (channel, username, self) => {
      if (!this.channels.has(channel)) {
        this.channels.set(channel, new ChannelSubject(this.client, channel));
      }
      const channelSubject = this.channels.get(channel);
      if (self) {
        const mod = this.client.isMod(channel, username);
        this.next({
          type: 'BOT_MOD',
          channel,
          mod,
        });
        channelSubject.setMod(mod);
        this.next({ type: 'BOT_JOINED', channel });
        return;
      }
      this.next({ type: 'USER_JOINED', username, channel });
      channelSubject.next({ type: 'USER_JOINED', username });
    });
    this.client.on('part', (channel, username, self) => {
      if (!this.channels.has(channel)) {
        this.channels.set(channel, new ChannelSubject(this.client, channel));
      }
      if (self) {
        this.channels.delete(channel);
        this.next({ type: 'BOT_LEFT', channel });
        return;
      }
      this.next({ type: 'USER_LEFT', username, channel });
      const channelSubject = this.channels.get(channel);
      channelSubject.next({ type: 'USER_LEFT', username });
    });
  }
}
