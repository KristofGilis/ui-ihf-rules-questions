import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { map } from 'rxjs';
import { GetVersionGQL } from '../../../graphql/generated';
import { RandomStateService } from '../questions/services/random-state.service';

@Component({
  selector: 'app-home',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardActions,
    MatCardTitle,
    MatCardContent,
    MatButton,
    TranslatePipe,
    RouterLink,
    MatSelect,
    MatOption,
    MatFormField,
    MatLabel,
    FormsModule,
    AsyncPipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly _versionGQL = inject(GetVersionGQL);
  private readonly _translateService = inject(TranslateService);

  randomStateService = inject(RandomStateService);
  questionCount = 10;

  private readonly _query = this._versionGQL.watch();

  version$ = this._query.valueChanges.pipe(
    onlyCompleteData(),
    map((x) => x.data.version)
  );

  constructor() {
    this._translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this._query.refetch());
  }
}
