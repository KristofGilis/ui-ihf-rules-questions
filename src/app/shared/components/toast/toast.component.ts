import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  template: `
    @if (toasts().length > 0) {
      <div class="toast-container">
        @for (toast of toasts(); track toast.id) {
          <div
            class="toast toast-{{ toast.type }}"
            role="alert"
            [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'">
            <div class="toast-content">
              <span class="toast-icon">{{ getIcon(toast.type) }}</span>
              <div class="toast-message">{{ toast.message }}</div>
              @if (toast.dismissible) {
                <button class="toast-close" (click)="dismiss(toast.id)" aria-label="Close notification">×</button>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: `
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast {
      max-width: 400px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      font-size: 14px;
      line-height: 1.5;
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
    }

    .toast-error {
      background-color: #dc2626;
      color: white;
    }

    .toast-warning {
      background-color: #f59e0b;
      color: white;
    }

    .toast-success {
      background-color: #16a34a;
      color: white;
    }

    .toast-info {
      background-color: #2563eb;
      color: white;
    }

    .toast-content {
      display: flex;
      gap: 12px;
      align-items: start;
    }

    .toast-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 0;
      flex-shrink: 0;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 640px) {
      .toast-container {
        left: 20px;
        right: 20px;
      }

      .toast {
        max-width: none;
      }
    }
  `,
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
