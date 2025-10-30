import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatIconButton, MatIcon],
  template: `
    <button
      type="button"
      mat-icon-button
      (click)="toggleTheme()"
      [attr.aria-label]="'Toggle ' + (themeService.effectiveTheme() === 'dark' ? 'light' : 'dark') + ' theme'"
    >
      <mat-icon>{{ themeService.effectiveTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
