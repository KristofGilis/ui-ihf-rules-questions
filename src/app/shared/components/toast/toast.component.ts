import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faChevronUp,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
  faSpinner,
  faXmark,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { ConnectivityService } from '../../../services/connectivity.service';
import { Toast, ToastService, ToastType } from '../../../services/toast.service';

interface SwipeState {
  id: number;
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  dx: number;
  dy: number;
  mode: 'undecided' | 'swipe' | 'reorder';
}

const SWIPE_AXIS_THRESHOLD = 8;
const SWIPE_DISMISS_DISTANCE = 80;
const SWIPE_DISMISS_VELOCITY = 0.5; // px/ms

/**
 * Toast notification view.
 * State lives in ToastService; this component is the visual surface.
 */
@Component({
  selector: 'app-toast',
  imports: [FaIconComponent],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly _service = inject(ToastService);
  private readonly _connectivity = inject(ConnectivityService);

  readonly toasts = this._service.toasts;
  readonly isOnline = this._connectivity.isOnline;
  readonly expanded = signal(false);
  readonly swipe = signal<SwipeState | null>(null);

  // Icons
  readonly faXmark = faXmark;
  readonly faChevronUp = faChevronUp;

  /** Most recently added toast — shown when collapsed. */
  readonly latestToast = computed(() => {
    const list = this.toasts();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  readonly hiddenCount = computed(() => Math.max(0, this.toasts().length - 1));

  readonly isCollapsed = computed(() => !this.expanded() && this.toasts().length > 1);

  /** Toasts to render (chronological order; visible-first comes last when collapsed → list of 1). */
  readonly visibleToasts = computed<Toast[]>(() => {
    const list = this.toasts();
    if (list.length <= 1 || this.expanded()) {
      return list;
    }
    const latest = list[list.length - 1];
    return latest ? [latest] : [];
  });

  /** Auto-collapse once the stack shrinks back to a single toast. */
  constructor() {
    // No effect needed — getters compute on demand; expanded auto-bypassed when length<=1.
  }

  // ----------------------------------------------------------- presentation

  getIcon(type: ToastType): IconDefinition {
    switch (type) {
      case 'error':
        return faCircleXmark;
      case 'warning':
        return faCircleExclamation;
      case 'success':
        return faCircleCheck;
      case 'info':
        return faCircleInfo;
      case 'loading':
        return faSpinner;
    }
  }

  getBannerClasses(type: ToastType): string {
    switch (type) {
      case 'error':
        return 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-500 dark:text-rose-950 dark:border-rose-600';
      case 'warning':
        return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-500 dark:text-amber-950 dark:border-amber-600';
      case 'success':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-500 dark:text-emerald-950 dark:border-emerald-600';
      case 'info':
        return 'bg-cyan-100 text-cyan-900 border-cyan-200 dark:bg-cyan-500 dark:text-cyan-950 dark:border-cyan-600';
      case 'loading':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500 dark:text-white dark:border-slate-600';
    }
  }

  ariaLive(type: ToastType): 'assertive' | 'polite' {
    return type === 'error' ? 'assertive' : 'polite';
  }

  // ----------------------------------------------------------- interactions

  dismiss(id: number): void {
    this._service.dismiss(id);
    // If we just dropped to <=1 toast, ensure collapsed view returns.
    if (this.toasts().length <= 2) {
      this.expanded.set(false);
    }
  }

  executeAction(id: number, callback: () => void): void {
    callback();
    this.dismiss(id);
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  trackById(_index: number, toast: Toast): number {
    return toast.id;
  }

  /** Inline style for a toast being swiped/dragged. */
  dragStyle(toast: Toast): Record<string, string> {
    const s = this.swipe();
    if (!s || s.id !== toast.id || s.mode === 'undecided') {
      return {};
    }
    if (s.mode === 'swipe') {
      const opacity = Math.max(0, 1 - Math.abs(s.dx) / 200);
      return {
        transform: `translateX(${s.dx}px)`,
        opacity: String(opacity),
        transition: 'none',
      };
    }
    // reorder
    return {
      transform: `translateY(${s.dy}px) scale(1.02)`,
      transition: 'none',
      'z-index': '1',
    };
  }

  /** Offset for non-dragged toasts in expanded mode to make space for the dragged one. */
  reorderShiftStyle(toast: Toast): Record<string, string> {
    const s = this.swipe();
    if (!s || s.mode !== 'reorder' || s.id === toast.id) {
      return {};
    }
    const list = this.toasts();
    const draggedIndex = list.findIndex((t) => t.id === s.id);
    const thisIndex = list.findIndex((t) => t.id === toast.id);
    if (draggedIndex < 0 || thisIndex < 0) {
      return {};
    }
    // Toasts above the dragged one shift down when it moves up past them, etc.
    // Simple linear approximation: shift cards in the dragged item's direction.
    const itemHeight = 84; // approximate card height + gap
    const swapDelta = Math.round(s.dy / itemHeight);
    const targetIndex = Math.max(0, Math.min(list.length - 1, draggedIndex + swapDelta));
    if (thisIndex > draggedIndex && thisIndex <= targetIndex) {
      return { transform: 'translateY(-100%)', transition: 'transform 0.18s ease' };
    }
    if (thisIndex < draggedIndex && thisIndex >= targetIndex) {
      return { transform: 'translateY(100%)', transition: 'transform 0.18s ease' };
    }
    return { transition: 'transform 0.18s ease' };
  }

  isReorderEnabled(): boolean {
    return this.expanded() && this.toasts().length > 1;
  }

  onPointerDown(event: PointerEvent, toast: Toast): void {
    if (!toast.dismissible && !this.isReorderEnabled()) {
      return;
    }
    // Ignore drags that start on an interactive element.
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a')) {
      return;
    }
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.swipe.set({
      id: toast.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      dx: 0,
      dy: 0,
      mode: 'undecided',
    });
    this._service.pauseAutoDismiss(toast.id);
  }

  onPointerMove(event: PointerEvent): void {
    const s = this.swipe();
    if (!s || s.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - s.startX;
    const dy = event.clientY - s.startY;
    let mode = s.mode;
    if (mode === 'undecided') {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX < SWIPE_AXIS_THRESHOLD && absY < SWIPE_AXIS_THRESHOLD) {
        this.swipe.set({ ...s, dx, dy });
        return;
      }
      if (absX > absY) {
        const current = this.toasts().find((t) => t.id === s.id);
        if (!current?.dismissible) {
          this.cancelSwipe();
          return;
        }
        mode = 'swipe';
      } else if (this.isReorderEnabled()) {
        mode = 'reorder';
      } else {
        this.cancelSwipe();
        return;
      }
    }
    this.swipe.set({ ...s, dx, dy, mode });
  }

  onPointerUp(event: PointerEvent, toast: Toast): void {
    const s = this.swipe();
    if (!s || s.pointerId !== event.pointerId) {
      return;
    }
    const elapsed = Math.max(1, performance.now() - s.startTime);
    if (s.mode === 'swipe') {
      const velocity = Math.abs(s.dx) / elapsed;
      if (Math.abs(s.dx) > SWIPE_DISMISS_DISTANCE || velocity > SWIPE_DISMISS_VELOCITY) {
        this.swipe.set(null);
        this._service.dismiss(toast.id);
        return;
      }
    } else if (s.mode === 'reorder') {
      this.commitReorder(s);
    }
    // snap back / no-op
    this.swipe.set(null);
    this._service.resumeAutoDismiss(toast.id);
  }

  onPointerCancel(event: PointerEvent, toast: Toast): void {
    const s = this.swipe();
    if (!s || s.pointerId !== event.pointerId) {
      return;
    }
    this.swipe.set(null);
    this._service.resumeAutoDismiss(toast.id);
  }

  private cancelSwipe(): void {
    const s = this.swipe();
    if (!s) {
      return;
    }
    this.swipe.set(null);
    this._service.resumeAutoDismiss(s.id);
  }

  private commitReorder(s: SwipeState): void {
    const list = [...this.toasts()];
    const fromIndex = list.findIndex((t) => t.id === s.id);
    if (fromIndex < 0) {
      return;
    }
    const itemHeight = 84;
    const swapDelta = Math.round(s.dy / itemHeight);
    const toIndex = Math.max(0, Math.min(list.length - 1, fromIndex + swapDelta));
    if (toIndex === fromIndex) {
      return;
    }
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    this._service.reorder(list);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.expanded()) {
      this.expanded.set(false);
    }
  }
}
