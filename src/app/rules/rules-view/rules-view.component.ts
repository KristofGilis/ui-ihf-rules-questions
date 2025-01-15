import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Rule } from '../../../../graphql/generated';

@Component({
  selector: 'app-rules-view',
  imports: [MatProgressSpinner, MatNavList, MatListItem, RouterLink],
  templateUrl: './rules-view.component.html',
  styleUrl: './rules-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesViewComponent {
  @Input({ required: true }) rules: Rule[] = [];
  @Input({ required: true }) loading = false;
}
