import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-hero',
  templateUrl: './page-hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeroComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly icon = input(false);
  readonly badge = input(false);
  readonly size = input<'default' | 'small'>('default');
}
