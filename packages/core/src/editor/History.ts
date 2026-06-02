export interface Command {
  execute(): void;
  undo(): void;
}

export class History {
  private stack: Command[] = [];
  private cursor = -1;

  constructor(private readonly maxSteps = 100) {}

  push(command: Command): void {
    if (this.cursor < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.cursor + 1);
    }
    this.stack.push(command);
    if (this.stack.length > this.maxSteps) {
      this.stack.shift();
    }
    this.cursor = this.stack.length - 1;
    command.execute();
  }

  undo(): boolean {
    if (this.cursor < 0) return false;
    this.stack[this.cursor].undo();
    this.cursor--;
    return true;
  }

  redo(): boolean {
    if (this.cursor >= this.stack.length - 1) return false;
    this.cursor++;
    this.stack[this.cursor].execute();
    return true;
  }

  canUndo(): boolean {
    return this.cursor >= 0;
  }

  canRedo(): boolean {
    return this.cursor < this.stack.length - 1;
  }

  clear(): void {
    this.stack = [];
    this.cursor = -1;
  }
}
