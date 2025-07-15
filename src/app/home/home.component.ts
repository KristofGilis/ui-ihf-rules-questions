import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
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

  randomStateService = inject(RandomStateService);
  questionCount = 10;

  version$ = this._versionGQL.watch().valueChanges.pipe(map((x) => x.data?.version));
}
