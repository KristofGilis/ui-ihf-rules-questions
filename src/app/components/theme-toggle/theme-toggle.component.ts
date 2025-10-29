import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
      [attr.aria-label]="
        themeService.currentTheme === 'light'
          ? 'Switch to dark theme'
          : 'Switch to light theme'
      "
      [attr.aria-pressed]="themeService.currentTheme === 'dark'">
      <mat-icon>
        {{ themeService.currentTheme === 'light' ? 'dark_mode' : 'light_mode' }}
      </mat-icon>
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
