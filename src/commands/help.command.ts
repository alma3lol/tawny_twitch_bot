import { Command } from '../command.class';

export class HelpCommand extends Command {
  Command() {
    if (this.args.length === 0)
      this.channelSubject.next(
        `@${this.user.username} call 911 instead of chatting here!`,
      );
    else {
      switch (this.args[0]) {
        case 'add':
          this.channelSubject.next(
            `!add question (clue|options) <question>:<clue|options>:answer`,
          );
          this.channelSubject.next(
            `You can add a 'clue' question which has a clue of the answer, or an options question which provides options instead.`,
          );
          this.channelSubject.next(
            `Ex: !add question clue an artist and a painter with a famous painting:he's italian:Leonardo da Vinci`,
          );
          this.channelSubject.next(
            `Ex: !add question options an artist and a painter with a famous painting:Leonardo da Vinci,Niccolo Machiavelli,Albert Einstein:Leonardo da Vinci`,
          );
          break;
        case 'milk':
          this.channelSubject.next(`!milk [width]`);
          this.channelSubject.next(`Draw an (n) width pyramid (max: 5).`);
          break;
        case 'start':
          this.channelSubject.next(`!start questions`);
          this.channelSubject.next(`Start a game of type questions with.`);
          break;
        case 'end':
          this.channelSubject.next(`!end (<name>|last)`);
          this.channelSubject.next(
            `End a game named <name> or the last game started.`,
          );
          break;
        default:
          break;
      }
    }
  }
}
