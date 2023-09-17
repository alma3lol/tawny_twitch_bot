import * as _ from 'lodash';
import { Subject, interval } from 'rxjs';
import { Client } from 'tmi.js';

export type UserJoined = {
  type: 'USER_JOINED';
  username: string;
};

export type UserLeft = {
  type: 'USER_LEFT';
  username: string;
};

export type InstantMessage = {
  type: 'INSTANT_MESSAGE';
  msg: string;
};

export type DelayedMessage = {
  type: 'DELAYED_MESSAGE';
  msg: string;
};

export class ChannelSubject extends Subject<
  UserJoined | UserLeft | InstantMessage | DelayedMessage
> {
  private messageQueue: string[] = [];
  private users: string[] = [];
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
      switch (msg.type) {
        case 'INSTANT_MESSAGE':
          this.messageQueue.push(msg.msg);
          break;
        case 'DELAYED_MESSAGE':
          this.client.say(this.channel, msg.msg);
          break;
        case 'USER_JOINED':
          if (!_.includes(this.users, msg.username.toLowerCase()))
            this.users.push(msg.username.toLowerCase());
          break;
        case 'USER_LEFT':
          if (_.includes(this.users, msg.username.toLowerCase()))
            this.users = _.filter(
              this.users,
              (user) => user !== msg.username.toLowerCase(),
            );
          break;
      }
    });
  }

  getUsers = () => this.users;
}
