import { Command } from 'src/command.class';

export class HelpCommand extends Command {
  Command() {
    if (this.args.length === 0)
      this.client.say(
        this.channel,
        `@${this.user.username} call 911 instead of chatting here!`,
      );
    else {
      switch (this.args[0]) {
        case 'add':
          this.client.say(
            this.channel,
            `!add question (clue|options) <question>:<clue|options>:answer`,
          );
          this.client.say(
            this.channel,
            `You can add a 'clue' question which has a clue of the answer, or an options question which provides options instead.`,
          );
          this.client.say(
            this.channel,
            `Ex: !add question clue an artist and a painter with a famous painting:he's italian:Leonardo da Vinci`,
          );
          this.client.say(
            this.channel,
            `Ex: !add question options an artist and a painter with a famous painting:Leonardo da Vinci,Niccolo Machiavelli,Albert Einstein:Leonardo da Vinci`,
          );
          break;
        case 'milk':
          this.client.say(this.channel, `!milk [width]`);
          this.client.say(this.channel, `Draw an (n) width pyramid (max: 5).`);
          break;
        case 'start':
          this.client.say(this.channel, `!start questions`);
          this.client.say(this.channel, `Start a game of type questions with.`);
          break;
        case 'end':
          this.client.say(this.channel, `!end (<name>|last)`);
          this.client.say(
            this.channel,
            `End a game named <name> or the last game started.`,
          );
          break;
        default:
          break;
      }
    }
  }
}
