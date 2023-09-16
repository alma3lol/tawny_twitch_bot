import { Command } from '../command.class';

export class HelloCommand extends Command {
  Command(): void {
    this.channelSubject.next(`@${this.user.username}, heya!`);
  }
}
