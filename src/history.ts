import { clonedValues } from './index';
import type { Key } from './type';

export interface Action<T = any> {
  type: string;
  payload: T;
}

export class History<T extends object> {
  private history: T[] = [];
  private currentIndex = -1;

  constructor(private state: T) {
    this.record(state);
  }

  public record(state: T): void {
    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }
    this.history.push(clonedValues(state));
    this.currentIndex++;
  }

  public undo(): T | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return clonedValues(this.history[this.currentIndex]);
    }
    return null;
  }

  public redo(): T | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return clonedValues(this.history[this.currentIndex]);
    }
    return null;
  }

  public getCurrentState(): T | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return clonedValues(this.history[this.currentIndex]);
    }
    return null;
  }
}
