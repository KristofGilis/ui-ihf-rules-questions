import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { asyncScheduler, filter, observeOn } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScrollRestorationService {
  private _router = inject(Router);
  private _scrollPositions = new Map<string, number>();
  private _currentUrl = '';

  constructor() {
    // Save scroll position before navigation
    this._router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event: Event) => event instanceof NavigationStart)
      )
      .subscribe(() => {
        if (this._currentUrl) {
          this._scrollPositions.set(this._currentUrl, window.scrollY);
        }
      });

    // Restore scroll position after navigation
    this._router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event: Event) => event instanceof NavigationEnd),
        observeOn(asyncScheduler)
      )
      .subscribe((event: NavigationEnd) => {
        this._currentUrl = event.urlAfterRedirects;
        const savedPosition = this._scrollPositions.get(this._currentUrl);

        if (savedPosition !== undefined && savedPosition > 0) {
          window.scrollTo(0, savedPosition);
        } else {
          window.scrollTo(0, 0);
        }
      });
  }
}
