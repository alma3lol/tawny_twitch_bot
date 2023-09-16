import { Command } from '../command.class';

export class MilkCommand extends Command {
  Command(): void {
    let width = 3;
    try {
      width = parseInt(this.args[0]);
      if (Number.isNaN(width)) width = 3;
      if (width > 5) width = 5;
    } catch (_e) {}
    for (let i = 0; i < width; i++) {
      this.channelSubject.next('milk '.repeat(i + 1).trim());
    }
    for (let i = width - 1; i > 0; i--) {
      this.channelSubject.next('milk '.repeat(i).trim());
    }
  }
}
