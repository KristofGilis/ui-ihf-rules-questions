import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Rule } from '../../../../graphql/generated';
import { EmptyStateComponent, LoadingSpinnerComponent } from '../../shared/components';

@Component({
  selector: 'app-rules-view',
  imports: [RouterLink, TranslatePipe, LoadingSpinnerComponent, EmptyStateComponent, FaIconComponent],
  templateUrl: './rules-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesViewComponent {
  readonly rules = input.required<Rule[]>();
  readonly loading = input.required<boolean>();
  readonly faChevronRight = faChevronRight;
  readonly faFileAlt = faFileAlt;
}
