import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Rule } from '../../../../graphql/generated';

@Component({
  selector: 'app-rules-view',
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './rules-view.component.html',
  styleUrl: './rules-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesViewComponent {
  readonly rules = input.required<Rule[]>();
  readonly loading = input.required<boolean>();

  faSpinner = faSpinner;
  faChevronRight = faChevronRight;
}
