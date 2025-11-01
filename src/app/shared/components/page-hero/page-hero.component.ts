import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-hero',
  imports: [],
  templateUrl: './page-hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeroComponent {
  title = input<string>('');
  description = input<string>('');
  icon = input(false);
  badge = input(false);
}
