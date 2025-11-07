import { Injectable } from '@angular/core';

export type ToastType = 'error' | 'warning' | 'success' | 'info';
export type ToastDuration = number; // milliseconds

export interface ToastOptions {
  type?: ToastType;
  duration?: ToastDuration;
  dismissible?: boolean;
}

/**
 * Simple toast notification service
 * Displays inline notifications without external dependencies
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private styleInjected = false;

  /**
   * Show an error toast
   */
  error(message: string, duration: ToastDuration = 5000): void {
    this.show(message, { type: 'error', duration });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration: ToastDuration = 5000): void {
    this.show(message, { type: 'warning', duration });
  }

  /**
   * Show a success toast
   */
  success(message: string, duration: ToastDuration = 3000): void {
    this.show(message, { type: 'success', duration });
  }

  /**
   * Show an info toast
   */
  info(message: string, duration: ToastDuration = 3000): void {
    this.show(message, { type: 'info', duration });
  }

  /**
   * Show a toast notification
   */
  show(message: string, options: ToastOptions = {}): void {
    const { type = 'info', duration = 3000, dismissible = true } = options;

    // Inject CSS styles once
    if (!this.styleInjected) {
      this.injectStyles();
      this.styleInjected = true;
    }

    const toast = this.createToast(message, type, dismissible);
    document.body.appendChild(toast);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismissToast(toast);
      }, duration);
    }
  }

  /**
   * Create a toast element
   */
  private createToast(message: string, type: ToastType, dismissible: boolean): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const config = this.getToastConfig(type);

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${config.icon}</span>
        <div class="toast-message">${this.escapeHtml(message)}</div>
        ${
          dismissible
            ? `<button 
                class="toast-close" 
                onclick="this.parentElement.parentElement.remove()" 
                aria-label="Close notification"
              >×</button>`
            : ''
        }
      </div>
    `;

    return toast;
  }

  /**
   * Dismiss a toast with animation
   */
  private dismissToast(toast: HTMLElement): void {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }

  /**
   * Get configuration for toast type
   */
  private getToastConfig(type: ToastType): { icon: string; bgColor: string } {
    const configs = {
      error: { icon: '❌', bgColor: '#dc2626' },
      warning: { icon: '⚠️', bgColor: '#f59e0b' },
      success: { icon: '✓', bgColor: '#16a34a' },
      info: { icon: 'ℹ️', bgColor: '#2563eb' },
    };
    return configs[type];
  }

  /**
   * Inject CSS styles for toasts
   */
  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        animation: slideIn 0.3s ease-out;
        margin-bottom: 12px;
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

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      /* Stack multiple toasts */
      .toast:not(:first-child) {
        margin-top: 12px;
      }

      /* Mobile responsiveness */
      @media (max-width: 640px) {
        .toast {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
