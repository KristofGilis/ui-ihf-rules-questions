import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Rule } from '../../../../graphql/generated';

@Component({
  selector: 'app-rules-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './rules-view.component.html',
  styleUrl: './rules-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesViewComponent {
  readonly rules = input.required<Rule[]>();
  readonly loading = input.required<boolean>();
}
