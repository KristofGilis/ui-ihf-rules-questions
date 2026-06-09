import { Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge, of, shareReplay } from 'rxjs';

/**
 * Shared connectivity status. Exposes both a signal (for components/templates)
 * and an observable (for non-Angular consumers such as Apollo links).
 */
@Service()
export class ConnectivityService {
  readonly isOnline$ = merge(
    of(navigator.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  readonly isOnline = toSignal(this.isOnline$, { initialValue: navigator.onLine });

  /** Synchronous snapshot for callers that need a one-shot boolean. */
  get online(): boolean {
    return navigator.onLine;
  }
}
