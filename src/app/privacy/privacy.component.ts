import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageContainerComponent } from '../shared/components/page-container/page-container.component';

@Component({
  imports: [PageContainerComponent, TranslatePipe],
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyComponent {}
