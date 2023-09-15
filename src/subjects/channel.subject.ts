import { Subject, interval } from 'rxjs';
import { Client } from 'tmi.js';

export class ChannelSubject extends Subject<string> {
  private messageQueue: string[] = [];
  constructor(
    private readonly client: Client,
    readonly channel: string,
  ) {
    super();
    interval(1000).subscribe(() => {
      if (this.messageQueue.length === 0) return;
      this.client.say(this.channel, this.messageQueue.shift());
    });
    this.subscribe((msg) => {
      this.messageQueue.push(msg);
    });
  }
}
