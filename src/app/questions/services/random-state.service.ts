import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RandomStateService {
  random = signal<{ isRandom: boolean; count: number }>({
    isRandom: false,
    count: 0,
  });
}
