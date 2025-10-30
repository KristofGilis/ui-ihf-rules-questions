import { Injectable, signal } from '@angular/core';

export interface QuizState {
  isRandom: boolean;
  count: number;
  timed?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RandomStateService {
  random = signal<QuizState>({
    isRandom: false,
    count: 0,
    timed: false,
  });
}
