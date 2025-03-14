import { SvelteMap as Map, SvelteSet as Set } from 'svelte/reactivity';
import type { ToastItem } from './types';

export class Toast {
  private maxItemsOnScreen = 3;
  private timerLength = 3000;
  private items = new Map<string, ToastItem>();
  private paused = new Set<string>();
  private queued = new Set<string>();
  private showing = new Set<string>();
  private timers = new Map<string, Timer>();

  get showingItems() {
    return [...this.showing].map((id) => ({
      id,
      ...this.items.get(id)!
    }));
  }

  public add(item: ToastItem) {
    const id = Math.random().toString(36).substring(2, 8);
    this.items.set(id, item);

    if (this.showing.size + 1 > this.maxItemsOnScreen) {
      this.queued.add(id);
    } else {
      this.showing.add(id);
      this.timers.set(
        id,
        setTimeout(() => this.removeShowingItem(id), this.timerLength)
      );
    }
  }

  public pause(id: string) {
    const showing = [...this.showing];
    const afterCurrent = showing.slice(showing.indexOf(id));

    for (const item of afterCurrent) {
      this.paused.add(item);
      clearTimeout(this.timers.get(item)!);
      this.timers.delete(item);
    }
  }

  public resume() {
    const paused = [...this.paused];

    for (let i = 0; i < paused.length; i++) {
      this.timers.set(
        paused[i],
        setTimeout(() => this.removeShowingItem(paused[i]), this.timerLength + 150 * i)
      );
    }

    this.paused = new Set();
  }

  private removeShowingItem(id: string) {
    this.showing.delete(id);
    this.items.delete(id);
    this.timers.delete(id);

    if (this.queued.size <= 0) return;

    const nextId = [...this.queued][0];
    this.queued.delete(nextId);
    this.showing.add(nextId);
    this.timers.set(
      nextId,
      setTimeout(() => this.removeShowingItem(nextId), this.timerLength)
    );
  }
}

export const toast = new Toast();
