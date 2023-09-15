import { Command } from 'src/command.class';
import { Game, Score } from '../../src/generated/client';

export class EndCommand extends Command {
  async Command() {
    try {
      const lastGame = await this.prismaService.game.findFirst({
        where: { ended: false },
      });
      if (lastGame === null) throw new Error();
      const game = await this.prismaService.game.update({
        where: { id: lastGame.id },
        data: { ended: true },
        include: { scores: true },
      });
      this.endGame(game);
    } catch (_e) {
      this.client.say(this.channel, `There is no active game!`);
    }
  }

  endGame = async (game: Game & { scores: Score[] }) => {
    this.client.say(
      this.channel,
      `Game ${game.type} has ended. And the winner is...`,
    );
    setTimeout(async () => {
      const winner = await this.prismaService.score.findFirst({
        where: { game: { id: game.id } },
        orderBy: { score: 'desc' },
        include: { user: true },
      });
      if (winner === null || winner.score === 0) {
        this.client.say(this.channel, `No one :) Shame on you :)`);
      } else {
        const winnerText = `🎉 @${winner.user.username} 🎉`;
        this.client.say(this.channel, `🎉`.repeat(winnerText.length / 2));
        this.client.say(this.channel, winnerText);
        this.client.say(this.channel, `🎉`.repeat(winnerText.length / 2));
      }
    }, 3000);
  };
}
