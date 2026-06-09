import { DOCUMENT } from '@angular/common';
import { computed, inject, Service, signal } from '@angular/core';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Service()
export class SidebarService {
  private readonly _document = inject(DOCUMENT);

  readonly expanded = signal(false);
  readonly position = signal<'left' | 'right'>('left');

  readonly collapseIcon = computed(() => {
    const isLeft = this.position() === 'left';
    const exp = this.expanded();
    return (isLeft && !exp) || (!isLeft && exp) ? faChevronRight : faChevronLeft;
  });

  constructor() {
    const ls = this._document.defaultView?.localStorage;
    this.expanded.set(ls?.getItem('sidebar-expanded') === 'true');
    const pos = ls?.getItem('sidebar-position');
    if (pos === 'left' || pos === 'right') {
      this.position.set(pos);
    }
  }

  toggleExpanded(): void {
    const next = !this.expanded();
    this.expanded.set(next);
    this._document.defaultView?.localStorage?.setItem('sidebar-expanded', String(next));
  }

  setExpanded(value: boolean): void {
    this.expanded.set(value);
    this._document.defaultView?.localStorage?.setItem('sidebar-expanded', String(value));
  }

  togglePosition(): void {
    const next = this.position() === 'left' ? 'right' : 'left';
    this.setPosition(next);
  }

  setPosition(value: 'left' | 'right'): void {
    this.position.set(value);
    this._document.defaultView?.localStorage?.setItem('sidebar-position', value);
  }
}
