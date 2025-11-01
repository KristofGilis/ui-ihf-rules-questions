import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  templateUrl: './page-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {
  readonly gradient = input(true);
  readonly maxWidth = input('max-w-7xl');
  readonly padding = input('py-12 pb-24');
}
