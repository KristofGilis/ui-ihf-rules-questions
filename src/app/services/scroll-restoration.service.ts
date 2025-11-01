import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScrollRestorationService {
  private readonly _router = inject(Router);
  private readonly _scrollPositions = new Map<string, number>();
  private _currentUrl = '';

  constructor() {
    this.initialize();
  }

  public initialize(): void {
    // Save scroll position before navigation
    this._router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
      if (this._currentUrl) {
        this._scrollPositions.set(this._currentUrl, window.scrollY);
      }
    });

    // Restore scroll position after navigation - only once per unique URL
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
        distinctUntilChanged() // Only emit when URL actually changes
      )
      .subscribe((url: string) => {
        this._currentUrl = url;

        const savedPosition = this._scrollPositions.get(this._currentUrl);

        // Use requestAnimationFrame to wait for next paint cycle
        requestAnimationFrame(() => {
          if (savedPosition !== undefined && savedPosition > 0) {
            window.scrollTo(0, savedPosition);
          } else {
            window.scrollTo(0, 0);
          }
        });
      });
  }
}
