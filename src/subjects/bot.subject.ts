import { Subject } from 'rxjs';
import { PrismaService } from 'src/app.service';
import { ChatUserstate, Client } from 'tmi.js';
import {
  AddCommand,
  EndCommand,
  StartCommand,
  HelloCommand,
  HelpCommand,
  MilkCommand,
} from 'src/commands';
import { Command } from 'src/command.class';

export class BotSubject extends Subject<any> {
  constructor(
    private readonly client: Client,
    private readonly prismaService: PrismaService,
  ) {
    super();
    this.client.on('chat', async (channel, user, message, self) => {
      if (self) return;
      if (user['message-type'] === 'chat' && message.startsWith('!')) {
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
            channel: string,
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
            channel,
            user,
          ).Command();
        if (cmd in generalCommands)
          new generalCommands[cmd](
            this.client,
            this.prismaService,
            args,
            channel,
            user,
          ).Command();
      }
    });
    this.client.on('join', (channel, username, self) => {
      if (self) return;
      // this.client.say(channel, `Welcome @${username}`);
    });
  }
}
