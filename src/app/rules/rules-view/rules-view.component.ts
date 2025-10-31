import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Rule } from '../../../../graphql/generated';

@Component({
  selector: 'app-rules-view',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './rules-view.component.html',
  styleUrl: './rules-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesViewComponent {
  readonly rules = input.required<Rule[]>();
  readonly loading = input.required<boolean>();
}
