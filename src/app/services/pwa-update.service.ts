import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { filter, interval, switchMap } from 'rxjs';
import { ToastService } from './toast.service';

/**
 * Service to handle PWA updates
 * Checks for updates and notifies the user
 */
@Injectable({
  providedIn: 'root',
})
export class PwaUpdateService {
  private readonly _swUpdate = inject(SwUpdate);
  private readonly _toastService = inject(ToastService);
  private readonly _translateService = inject(TranslateService);
  private readonly _router = inject(Router);

  private _patchUpdatePending = false;

  /**
   * Setup PWA update checking with periodic checks and version update notifications
   * @param destroyRef DestroyRef from the caller for proper subscription cleanup
   */
  initializeUpdateCheck(destroyRef: DestroyRef): void {
    if (!this._swUpdate.isEnabled) {
      return;
    }

    // Check for updates on initialization
    this._swUpdate.checkForUpdate();

    // Check for updates every hour (3600000 ms)
    interval(3600000)
      .pipe(
        takeUntilDestroyed(destroyRef),
        switchMap(() => this._swUpdate.checkForUpdate())
      )
      .subscribe();

    // Listen for available updates
    this._swUpdate.versionUpdates.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        const currentVersion = this._parseVersion(
          (event.currentVersion.appData as { version?: string } | undefined)?.version
        );
        const latestVersion = this._parseVersion(
          (event.latestVersion.appData as { version?: string } | undefined)?.version
        );
        const isSignificantUpdate =
          currentVersion === null ||
          latestVersion === null ||
          latestVersion[0] > currentVersion[0] ||
          latestVersion[1] > currentVersion[1];

        if (isSignificantUpdate) {
          // Show update notification with action button
          this._toastService.show(this._translateService.instant('pwa.update_available'), {
            type: 'info',
            duration: 0,
            dismissible: true,
            action: {
              label: this._translateService.instant('pwa.update_now'),
              callback: () => this.activateUpdate(),
            },
          });
        } else {
          // Patch update: activate silently on next route navigation
          this._patchUpdatePending = true;
        }
      }
    });

    // Silently apply pending patch updates on route navigation
    this._router.events
      .pipe(
        takeUntilDestroyed(destroyRef),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this._patchUpdatePending) {
          this._patchUpdatePending = false;
          this.activateUpdate();
        }
      });
  }

  /**
   * Activate the pending update and reload the app
   */
  activateUpdate(): void {
    this._swUpdate.activateUpdate().then(() => {
      window.location.reload();
    });
  }

  /**
   * Parse a semver string into [major, minor, patch], or null if unparseable
   */
  private _parseVersion(version: string | undefined): [number, number, number] | null {
    if (!version) return null;
    const parts = version.split('.').map(Number);
    if (parts.length < 3 || parts.some(isNaN)) return null;
    return [parts[0], parts[1], parts[2]];
  }
}
