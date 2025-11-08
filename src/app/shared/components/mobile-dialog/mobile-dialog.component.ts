import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-mobile-dialog',
  imports: [FaIconComponent],
  templateUrl: './mobile-dialog.component.html',
  styleUrl: './mobile-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileDialogComponent {
  readonly open = input.required<boolean>();
  readonly closeTitle = input('Close');
  readonly backdropClose = input(true);

  readonly closed = output<void>();

  readonly faTimes = faTimes;

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.open()) {
      this.closed.emit();
    }
  }

  onBackdropClick(): void {
    if (this.backdropClose()) {
      this.closed.emit();
    }
  }

  onCloseClick(): void {
    this.closed.emit();
  }
}
