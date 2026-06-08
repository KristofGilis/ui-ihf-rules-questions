import { ViewportScroller } from '@angular/common';
import { Service, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Service()
export class ScrollRestorationService {
  private readonly _scrollPositions = new Map<string, [number, number]>();
  private readonly _router = inject(Router);
  private readonly _viewportScroller = inject(ViewportScroller);

  constructor() {
    // Save scroll position before navigation
    this._router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        const currentUrl = this._router.url;
        const position = this._viewportScroller.getScrollPosition();
        this._scrollPositions.set(currentUrl, position);
      });

    // Restore scroll position after navigation
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        const savedPosition = this._scrollPositions.get(url);

        if (savedPosition) {
          // Wait for content to render
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this._viewportScroller.scrollToPosition(savedPosition);
            });
          });
        } else {
          // No saved position, scroll to top
          this._viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }
}
