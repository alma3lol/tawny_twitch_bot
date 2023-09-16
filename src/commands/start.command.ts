import { Command } from '../command.class';
import { GameSubject } from '../subjects';

export class StartCommand extends Command {
  async Command() {
    const gameType = this.args[0];
    switch (gameType) {
      case 'questions':
        try {
          const count = await this.prismaService.question.count();
          if (count === 0) {
            this.channelSubject.next(
              `There are no questions yet! @${this.user.username} please add some questions with '!add question <...>'. See !help add`,
            );
            return;
          }
          const currentGame = await this.prismaService.game.findFirst({
            where: { ended: false },
          });
          if (currentGame === null) throw new Error();
          this.channelSubject.next(`A game is already in progress`);
          this.channelSubject.next(`You can end the current game with !end`);
        } catch (_e) {
          try {
            const game = await this.prismaService.game.create({
              data: {
                type: 'Questions',
                channel: this.channelSubject.channel,
                starter: {
                  connectOrCreate: {
                    where: { username: this.user.username },
                    create: { username: this.user.username },
                  },
                },
              },
              include: { starter: true },
            });
            this.channelSubject.next(`Starting game ${game.type}.`);
            const question = await this.pickAQuestion();
            const gameSubject = new GameSubject(
              game,
              question,
              this.client,
              this.prismaService,
              this.channelSubject,
              this.user,
            );
            gameSubject.next(question);
          } catch (e) {
            console.log(e);
            this.channelSubject.next(
              `Failed to create the game! Check console for info.`,
            );
          }
        }
        break;
      default:
        this.channelSubject.next(
          `Game type (${gameType}) is invalid. Valid type are: [questions].`,
        );
        break;
    }
  }

  pickAQuestion = async () => {
    const count = await this.prismaService.question.count();
    const questionNumber = Math.floor(Math.random() * count);
    const question = await this.prismaService.question.findFirstOrThrow({
      skip: Math.max(questionNumber - 1, 0),
      include: { answer: true },
    });
    return question;
  };
}
