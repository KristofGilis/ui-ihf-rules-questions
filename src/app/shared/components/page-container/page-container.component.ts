import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  imports: [],
  templateUrl: './page-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {
  gradient = input(true);
  maxWidth = input('max-w-7xl');
  padding = input('py-12 pb-24');
}
