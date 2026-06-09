import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Service,
  signal,
} from '@angular/core';
import { TOAST_DURATION } from '../constants';
import { ToastComponent } from '../shared/components/toast/toast.component';

export type ToastType = 'error' | 'warning' | 'success' | 'info' | 'loading';
export type ToastDuration = number;

export interface ToastAction {
  label: string;
  callback: () => void;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: ToastDuration;
  dismissible?: boolean;
  action?: ToastAction;
  /** Persist this toast across page reloads (sessionStorage). Default true for non-loading toasts. */
  persist?: boolean;
}

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  dismissible: boolean;
  duration: number;
  createdAt: number;
  expiresAt: number; // 0 when persistent (duration === 0)
  exiting: boolean;
  action?: ToastAction;
  persist: boolean;
}

export interface ToastHandle {
  readonly id: number;
  dismiss(): void;
  update(partial: ToastUpdate): void;
}

export interface ToastUpdate {
  message?: string;
  type?: ToastType;
  duration?: ToastDuration;
  dismissible?: boolean;
  action?: ToastAction | null;
}

const STORAGE_KEY = 'ihf.toasts';
const EXIT_ANIMATION_MS = 200;

interface StoredToast {
  id: number;
  message: string;
  type: ToastType;
  dismissible: boolean;
  duration: number;
  createdAt: number;
  expiresAt: number;
}

/**
 * Toast notification service.
 * Holds the source-of-truth toast list and lazily creates a ToastComponent
 * attached to <body> for presentation.
 */
@Service()
export class ToastService {
  private readonly _appRef = inject(ApplicationRef);
  private readonly _injector = inject(EnvironmentInjector);

  private _toastComponentRef: ComponentRef<ToastComponent> | null = null;
  private readonly _dismissTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly _removalTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private _nextId = 1;

  /** Source-of-truth toast list. Component reads from this signal. */
  readonly toasts = signal<Toast[]>([]);

  constructor() {
    // Defer rehydration until after the application bootstraps so component
    // creation has a valid view tree to attach into.
    queueMicrotask(() => this.rehydrate());
  }

  // ---------------------------------------------------------------- factories

  show(message: string, options: ToastOptions = {}): ToastHandle {
    const type = options.type ?? 'info';
    const duration = options.duration ?? this.defaultDuration(type);
    const dismissible = options.dismissible ?? type !== 'loading';
    const persist = options.persist ?? type !== 'loading';
    const id = this._nextId++;
    const now = Date.now();
    const toast: Toast = {
      id,
      message,
      type,
      dismissible,
      duration,
      createdAt: now,
      expiresAt: duration > 0 ? now + duration : 0,
      exiting: false,
      action: options.action,
      persist,
    };
    this.toasts.update((list) => [...list, toast]);
    this.ensureMounted();
    this.scheduleAutoDismiss(toast);
    this.save();
    return this.makeHandle(id);
  }

  error(message: string, duration: ToastDuration = TOAST_DURATION.ERROR): ToastHandle {
    return this.show(message, { type: 'error', duration });
  }

  warning(message: string, duration: ToastDuration = TOAST_DURATION.WARNING): ToastHandle {
    return this.show(message, { type: 'warning', duration });
  }

  success(message: string, duration: ToastDuration = TOAST_DURATION.SUCCESS): ToastHandle {
    return this.show(message, { type: 'success', duration });
  }

  info(message: string, duration: ToastDuration = TOAST_DURATION.INFO): ToastHandle {
    return this.show(message, { type: 'info', duration });
  }

  /** Loading toast: spinner, indefinite, non-dismissible by default. Resolve via handle. */
  loading(message: string, options: Omit<ToastOptions, 'type' | 'persist'> = {}): ToastHandle {
    return this.show(message, { ...options, type: 'loading', duration: 0, dismissible: false });
  }

  // ----------------------------------------------------------- mutation API

  /**
   * Begin dismissal of a toast. Plays the exit animation, then removes it.
   * Safe to call multiple times for the same id.
   */
  dismiss(id: number): void {
    const current = this.toasts().find((t) => t.id === id);
    if (!current || current.exiting) {
      return;
    }
    this.clearDismissTimer(id);
    this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    const timer = setTimeout(() => {
      this._removalTimers.delete(id);
      this.toasts.update((list) => list.filter((t) => t.id !== id));
      this.save();
    }, EXIT_ANIMATION_MS);
    this._removalTimers.set(id, timer);
    this.save();
  }

  /** Dismiss every active toast (plays exit animation for each). */
  dismissAll(): void {
    for (const t of this.toasts()) {
      this.dismiss(t.id);
    }
  }

  /**
   * Update an existing toast (e.g. transform a loading toast into a success/error).
   * Resets the auto-dismiss timer based on the new duration.
   */
  update(id: number, partial: ToastUpdate): void {
    const existing = this.toasts().find((t) => t.id === id);
    if (!existing || existing.exiting) {
      return;
    }
    const type = partial.type ?? existing.type;
    const duration = partial.duration ?? (partial.type ? this.defaultDuration(type) : existing.duration);
    const now = Date.now();
    const updated: Toast = {
      ...existing,
      message: partial.message ?? existing.message,
      type,
      duration,
      dismissible: partial.dismissible ?? (partial.type ? type !== 'loading' : existing.dismissible),
      action: partial.action === null ? undefined : (partial.action ?? existing.action),
      createdAt: now,
      expiresAt: duration > 0 ? now + duration : 0,
    };
    this.toasts.update((list) => list.map((t) => (t.id === id ? updated : t)));
    this.clearDismissTimer(id);
    this.scheduleAutoDismiss(updated);
    this.save();
  }

  /**
   * Replace the toast list (used by the component for drag-reorder).
   * Does not touch timers or trigger animations.
   */
  reorder(newOrder: Toast[]): void {
    this.toasts.set(newOrder);
    this.save();
  }

  /** Pause the auto-dismiss timer (used during pointer drag). */
  pauseAutoDismiss(id: number): void {
    this.clearDismissTimer(id);
  }

  /** Resume auto-dismiss using the remaining time on `expiresAt`. */
  resumeAutoDismiss(id: number): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (toast) {
      this.scheduleAutoDismiss(toast);
    }
  }

  // ------------------------------------------------------------- internals

  private defaultDuration(type: ToastType): number {
    switch (type) {
      case 'error':
        return TOAST_DURATION.ERROR;
      case 'warning':
        return TOAST_DURATION.WARNING;
      case 'success':
        return TOAST_DURATION.SUCCESS;
      case 'info':
        return TOAST_DURATION.INFO;
      case 'loading':
        return 0;
    }
  }

  private scheduleAutoDismiss(toast: Toast): void {
    if (toast.duration <= 0) {
      return;
    }
    const remaining = Math.max(0, toast.expiresAt - Date.now());
    const timer = setTimeout(() => {
      this._dismissTimers.delete(toast.id);
      this.dismiss(toast.id);
    }, remaining);
    this._dismissTimers.set(toast.id, timer);
  }

  private clearDismissTimer(id: number): void {
    const timer = this._dismissTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this._dismissTimers.delete(id);
    }
  }

  private makeHandle(id: number): ToastHandle {
    return {
      id,
      dismiss: () => this.dismiss(id),
      update: (partial) => this.update(id, partial),
    };
  }

  private ensureMounted(): void {
    if (this._toastComponentRef) {
      return;
    }
    this._toastComponentRef = createComponent(ToastComponent, { environmentInjector: this._injector });
    this._appRef.attachView(this._toastComponentRef.hostView);
    document.body.appendChild(this._toastComponentRef.location.nativeElement as HTMLElement);
    // Force the first change-detection pass so the host element gets its
    // initial markup before the next zone tick.
    this._toastComponentRef.changeDetectorRef.detectChanges();
  }

  // -------------------------------------------------------------- persistence

  private save(): void {
    try {
      const storage = window.sessionStorage;
      const persisted: StoredToast[] = this.toasts()
        .filter((t) => t.persist && !t.exiting && t.type !== 'loading')
        .map((t) => ({
          id: t.id,
          message: t.message,
          type: t.type,
          dismissible: t.dismissible,
          duration: t.duration,
          createdAt: t.createdAt,
          expiresAt: t.expiresAt,
        }));
      if (persisted.length === 0) {
        storage.removeItem(STORAGE_KEY);
      } else {
        storage.setItem(STORAGE_KEY, JSON.stringify(persisted));
      }
    } catch {
      // sessionStorage may be unavailable (private mode, quota); ignore.
    }
  }

  private rehydrate(): void {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (!raw) {
      return;
    }
    let stored: StoredToast[];
    try {
      stored = JSON.parse(raw) as StoredToast[];
    } catch {
      return;
    }
    const now = Date.now();
    const alive = stored.filter((s) => s.duration === 0 || s.expiresAt > now);
    if (alive.length === 0) {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    for (const s of alive) {
      const toast: Toast = {
        id: this._nextId++,
        message: s.message,
        type: s.type,
        dismissible: s.dismissible,
        duration: s.duration,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        exiting: false,
        action: undefined, // callbacks are not serializable
        persist: true,
      };
      this.toasts.update((list) => [...list, toast]);
      this.scheduleAutoDismiss(toast);
    }
    this.ensureMounted();
    this.save();
  }
}
