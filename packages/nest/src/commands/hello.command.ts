import { Command } from '../command.class';

export class HelloCommand extends Command {
  Command(): void {
    this.channelSubject.next({
      type: 'DELAYED_MESSAGE',
      msg: `@${this.user.username}, heya!`,
    });
  }
}
