import { Command } from 'src/command.class';

export class HelloCommand extends Command {
  Command(): void {
    this.client.say(this.channel, `@${this.user.username}, heya!`);
  }
}
