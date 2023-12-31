import { Command } from '../command.class';

export class AddCommand extends Command {
  async Command() {
    switch (this.args[0]) {
      case 'question':
        const [question, clueOrOptions, answer] = this.args
          .slice(2)
          .join(' ')
          .split(':');
        switch (this.args[1]) {
          case 'clue':
            await this.prismaService.question.create({
              data: {
                question,
                type: 'WITH_CLUE',
                clue: clueOrOptions,
                answer: { create: { answer, options: '' } },
              },
            });
            this.channelSubject.next({
              type: 'DELAYED_MESSAGE',
              msg: `Question added.`,
            });
            break;
          case 'options':
            await this.prismaService.question.create({
              data: {
                question,
                type: 'WITH_OPTIONS',
                clue: '',
                answer: {
                  create: {
                    answer,
                    options: JSON.stringify(
                      clueOrOptions
                        .split(',')
                        .map((option) => option.trim().toLowerCase()),
                    ),
                  },
                },
              },
            });
            this.channelSubject.next({
              type: 'DELAYED_MESSAGE',
              msg: `Question added.`,
            });
            break;
          default:
            this.channelSubject.next({
              type: 'DELAYED_MESSAGE',
              msg: `Question type (${this.args[1]}) is invalid. Try !help add.`,
            });
            break;
        }
        break;
      default:
        this.channelSubject.next({
          type: 'DELAYED_MESSAGE',
          msg: `Add type (${this.args[0]}) is invalid. Try !help add.`,
        });
        break;
    }
  }
}
