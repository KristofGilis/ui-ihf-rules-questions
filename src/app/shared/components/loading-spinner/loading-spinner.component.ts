import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-loading-spinner',
  imports: [FontAwesomeModule],
  templateUrl: './loading-spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly text = input<string>();
  readonly textClass = input<string>('text-slate-600 dark:text-slate-400');
  readonly faSpinner = faSpinner;

  readonly iconSize = computed(() => {
    const sizes = {
      sm: 'lg' as const,
      md: 'xl' as const,
      lg: '2x' as const,
      xl: '3x' as const,
    };
    return sizes[this.size()];
  });
}
