import { Component, signal } from '@angular/core';

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
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  toasts = signal<Toast[]>([]);

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
   * Get icon for toast type
   */
  getIcon(type: Toast['type']): string {
    const icons = {
      error: '❌',
      warning: '⚠️',
      success: '✓',
      info: 'ℹ️',
    };
    return icons[type];
  }
}
