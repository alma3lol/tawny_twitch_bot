import { Subject } from 'rxjs';
import { Game, User } from '../../src/generated/client';
import { PrismaService } from 'src/app.service';

export class UserSubject extends Subject<number | 'SAVE_SCORE'> {
  private score = 0;
  constructor(
    private readonly user: User,
    private readonly game: Game,
    private readonly prismaService: PrismaService,
  ) {
    super();
    this.subscribe(async (increaseOrSaveScore) => {
      if (increaseOrSaveScore === 'SAVE_SCORE') {
        await this.prismaService.user.update({
          where: { id: this.user.id },
          data: {
            scores: {
              create: {
                score: this.score,
                game: { connect: { id: this.game.id } },
              },
            },
          },
        });
      } else this.score += increaseOrSaveScore;
    });
  }
}
