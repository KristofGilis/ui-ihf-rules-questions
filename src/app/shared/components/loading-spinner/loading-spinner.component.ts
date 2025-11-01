import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  readonly sizeClass = computed(() => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };
    return sizes[this.size()];
  });
}
