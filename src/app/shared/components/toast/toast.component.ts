import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
  faXmark,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  dismissible: boolean;
}

/**
 * Toast notification component
 * Displays stacked toast messages in the top-right corner
 */
@Component({
  selector: 'app-toast',
  imports: [FontAwesomeModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  toasts = signal<Toast[]>([]);

  // Font Awesome icons
  readonly faXmark = faXmark;

  /**
   * Add a new toast notification
   */
  add(toast: Omit<Toast, 'id'>): number {
    const id = Date.now();
    this.toasts.update((toasts) => [...toasts, { ...toast, id }]);
    return id;
  }

  /**
   * Remove a toast by ID
   */
  dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Get Font Awesome icon for toast type
   */
  getIcon(type: Toast['type']): IconDefinition {
    const icons = {
      error: faCircleXmark,
      warning: faCircleExclamation,
      success: faCircleCheck,
      info: faCircleInfo,
    };
    return icons[type];
  }
}
