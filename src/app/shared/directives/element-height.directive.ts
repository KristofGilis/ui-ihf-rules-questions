import { DestroyRef, Directive, ElementRef, inject, OnInit, signal } from '@angular/core';

@Directive({
  selector: '[appElementHeight]',
  exportAs: 'appElementHeight',
})
export class ElementHeightDirective implements OnInit {
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _destroyRef = inject(DestroyRef);

  readonly height = signal(0);

  ngOnInit(): void {
    const observer = new ResizeObserver((entries) => {
      this.height.set(entries[0].contentRect.height);
    });
    observer.observe(this._el.nativeElement);
    this._destroyRef.onDestroy(() => observer.disconnect());
  }
}
