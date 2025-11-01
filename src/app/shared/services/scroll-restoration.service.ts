import { ViewportScroller } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScrollRestorationService {
  private scrollPositions = new Map<string, [number, number]>();
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);

  constructor() {
    // Save scroll position before navigation
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe(() => {
        const currentUrl = this.router.url;
        const position = this.viewportScroller.getScrollPosition();
        this.scrollPositions.set(currentUrl, position);
      });

    // Restore scroll position after navigation
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        const savedPosition = this.scrollPositions.get(url);

        if (savedPosition) {
          // Wait for content to render
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.viewportScroller.scrollToPosition(savedPosition);
            });
          });
        } else {
          // No saved position, scroll to top
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }
}
