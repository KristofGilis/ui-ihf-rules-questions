import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RandomStateService {
  readonly random = signal<{ isRandom: boolean; count: number }>({
    isRandom: false,
    count: 0,
  });

  setRandom(isRandom: boolean): void {
    this.random.update((state) => ({ ...state, isRandom }));
  }

  setCount(count: number): void {
    this.random.update((state) => ({ ...state, count }));
  }

  setRandomState(isRandom: boolean, count: number): void {
    this.random.set({ isRandom, count });
  }

  reset(): void {
    this.random.set({ isRandom: false, count: 0 });
  }
}
