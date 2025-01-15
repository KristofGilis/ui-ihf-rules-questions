import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, map, tap } from 'rxjs';
import { Rule } from '../../../graphql/generated';
import { RulesViewComponent } from './rules-view/rules-view.component';
import { RulesService } from './services/rules.service';

@Component({
  selector: 'app-rules',
  imports: [AsyncPipe, RulesViewComponent, TranslateModule],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesComponent {
  private _rulesService = inject(RulesService);

  loading = false;
  rules$ = this._rulesService.rules$.pipe(
    tap((x) => (this.loading = x.loading)),
    map((x) => x.data?.rules?.edges?.map((y) => y.node as Rule) ?? []),
    finalize(() => (this.loading = false))
  );
}
