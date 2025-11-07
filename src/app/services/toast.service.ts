import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable } from '@angular/core';
import { TOAST_DURATION } from '../constants';
import { ToastComponent } from '../shared/components/toast/toast.component';

export type ToastType = 'error' | 'warning' | 'success' | 'info';
export type ToastDuration = number; // milliseconds

export interface ToastOptions {
  type?: ToastType;
  duration?: ToastDuration;
  dismissible?: boolean;
}

/**
 * Toast notification service
 * Dynamically creates and manages a ToastComponent
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastComponentRef: ComponentRef<ToastComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  /**
   * Show an error toast
   */
  error(message: string, duration: ToastDuration = TOAST_DURATION.ERROR): void {
    this.show(message, { type: 'error', duration });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration: ToastDuration = TOAST_DURATION.WARNING): void {
    this.show(message, { type: 'warning', duration });
  }

  /**
   * Show a success toast
   */
  success(message: string, duration: ToastDuration = TOAST_DURATION.SUCCESS): void {
    this.show(message, { type: 'success', duration });
  }

  /**
   * Show an info toast
   */
  info(message: string, duration: ToastDuration = TOAST_DURATION.INFO): void {
    this.show(message, { type: 'info', duration });
  }

  /**
   * Show a toast notification
   */
  show(message: string, options: ToastOptions = {}): void {
    const { type = 'info', duration = TOAST_DURATION.INFO, dismissible = true } = options;

    // Create component if it doesn't exist
    if (!this.toastComponentRef) {
      this.createToastComponent();
    }

    // Add toast to the component
    const toastComponent = this.toastComponentRef!.instance;
    const toastId = toastComponent.add({ message, type, dismissible });

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        toastComponent.dismiss(toastId);
      }, duration);
    }
  }

  /**
   * Create the toast component and attach it to the DOM
   */
  private createToastComponent(): void {
    this.toastComponentRef = createComponent(ToastComponent, {
      environmentInjector: this.injector,
    });

    // Attach to application
    this.appRef.attachView(this.toastComponentRef.hostView);

    // Append to body
    const domElem = this.toastComponentRef.location.nativeElement as HTMLElement;
    document.body.appendChild(domElem);
  }
}
