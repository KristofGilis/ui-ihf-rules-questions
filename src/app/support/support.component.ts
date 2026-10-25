import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageContainerComponent } from '../shared/components/page-container/page-container.component';

@Component({
  imports: [PageContainerComponent, RouterLink, TranslatePipe],
  selector: 'app-support',
  templateUrl: './support.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {}
