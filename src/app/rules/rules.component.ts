import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { finalize, map, tap } from 'rxjs';
import { Rule } from '../../../graphql/generated';
import { PageContainerComponent, PageHeroComponent } from '../shared/components';
import { RulesViewComponent } from './rules-view/rules-view.component';
import { RulesService } from './services/rules.service';

@Component({
  selector: 'app-rules',
  imports: [AsyncPipe, TranslatePipe, RulesViewComponent, PageContainerComponent, PageHeroComponent],
  templateUrl: './rules.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesComponent {
  private readonly _rulesService = inject(RulesService);
  private readonly _translateService = inject(TranslateService);

  loading = signal(false);
  rules$ = this._rulesService.rules$.pipe(
    tap((x) => this.loading.set(x.loading)),
    onlyCompleteData(),
    map((x) => x.data.rules?.edges?.map((y) => y?.node as Rule) ?? []),
    finalize(() => this.loading.set(false))
  );

  constructor() {
    this._translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this._rulesService.refetch());
  }
}
