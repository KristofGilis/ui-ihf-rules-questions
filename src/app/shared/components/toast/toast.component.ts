import { Component, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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
  imports: [FaIconComponent],
  templateUrl: './toast.component.html',
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

  /**
   * Get Tailwind CSS classes for toast type
   */
  getToastClasses(type: Toast['type']): string {
    const classes = {
      error: 'bg-gradient-to-br from-red-500 to-rose-600 text-white',
      warning: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
      success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
      info: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
    };
    return classes[type];
  }
}
