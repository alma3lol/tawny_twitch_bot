import { Subject, of, timer } from 'rxjs';
import { Answer, Game, Question, User } from '../../src/generated/client';
import { UserSubject } from './user.subject';
import { ChatUserstate, Client } from 'tmi.js';
import { PrismaService } from '../app.service';
import * as moment from 'moment';
import { EndCommand } from '../commands';
import * as _ from 'lodash';
import { ChannelSubject } from './channel.subject';

export class GameSubject extends Subject<Question & { answer: Answer }> {
  private players = new Map<string, UserSubject>();
  private question: Question & { answer: Answer };
  private previousQuesionsIds: number[] = [];
  private playersWhoAnsweredQuestions = new Map<number, string[]>();

  constructor(
    private readonly game: Game & { starter: User },
    private readonly firstQuestion: Question & { answer: Answer },
    private readonly client: Client,
    private readonly prismaService: PrismaService,
    private readonly channelSubject: ChannelSubject,
    private readonly user: ChatUserstate,
  ) {
    super();
    this.question = this.firstQuestion;
    this.client.on('message', async (channel, user, msg, self) => {
      if (self || channel !== this.channelSubject.channel) return;
      if (
        msg.trim().toLowerCase() !==
          this.question.answer.answer.trim().toLowerCase() &&
        this.question.type !== 'WITH_OPTIONS'
      )
        return;
      if (this.question.type === 'WITH_OPTIONS') {
        const options: string[] = JSON.parse(this.question.answer.options);
        const answer = parseInt(msg.trim());
        if (Number.isNaN(answer)) return;
        if (answer > options.length) return;
        if (answer === 0) return;
        if (
          options[answer - 1].trim().toLowerCase() !==
          this.question.answer.answer.trim().toLowerCase()
        )
          return;
      }
      console.log(`Player (${user.username}) answered correctly`);
      if (!this.players.has(user.username)) {
        const player = await this.prismaService.user.upsert({
          where: { username: user.username },
          update: {},
          create: { username: user.username },
        });
        this.players.set(
          user.username,
          new UserSubject(player, this.game, this.prismaService),
        );
      }
      const playersWhoAnswered = this.playersWhoAnsweredQuestions.get(
        this.question.id,
      );
      if (_.includes(playersWhoAnswered, user.username)) return;
      playersWhoAnswered.push(user.username);
      this.playersWhoAnsweredQuestions.set(
        this.question.id,
        playersWhoAnswered,
      );
      this.players.get(user.username).next(1);
    });
    this.subscribe(async (question) => {
      this.playersWhoAnsweredQuestions.set(question.id, []);
      const msgs = [`Question: ${question.question}`];
      if (question.type === 'WITH_CLUE') msgs.push(`Clue: ${question.clue}`);
      else {
        const options: string[] = JSON.parse(question.answer.options);
        options.forEach((option, i) => {
          msgs.push(`${i + 1} - ${option}`);
        });
      }
      of(...msgs).subscribe({
        next: (msg) => {
          this.channelSubject.next(msg);
        },
        complete: () => {
          this.channelSubject.next(
            `You should answer ${moment().add(question.timer, 's').fromNow()}.`,
          );
          timer(Math.floor(question.timer / 2) * 1000).subscribe(() => {
            this.client.say(
              this.channelSubject.channel,
              `Half the time passed. Know the answer yet?`,
            );
            msgs.forEach((msg) => {
              this.channelSubject.next(msg);
            });
          });
          timer(question.timer * 1000).subscribe(async () => {
            this.channelSubject.next(`Time's up for this question.`);
            try {
              const q = await this.pickAQuestion();
              this.channelSubject.next(`Next question...`);
              this.next(q);
            } catch (_e) {
              this.channelSubject.next(`That was the last question.`);
              this.players.forEach((player) => {
                player.next('SAVE_SCORE');
              });
              await new EndCommand(
                this.client,
                this.prismaService,
                [],
                this.channelSubject,
                this.user,
              ).Command();
            }
          });
        },
      });
      this.previousQuesionsIds.push(question.id);
      this.question = question;
    });
  }

  pickAQuestion = async () => {
    const count =
      (await this.prismaService.question.count()) -
      this.previousQuesionsIds.length;
    const questionNumber = Math.floor(Math.random() * count);
    const question = await this.prismaService.question.findFirstOrThrow({
      skip: Math.max(questionNumber - 1, 0),
      include: { answer: true },
      where: { id: { notIn: this.previousQuesionsIds } },
    });
    return question;
  };
}
