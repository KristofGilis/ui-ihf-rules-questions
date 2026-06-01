import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Rule } from '../../../../graphql/types';
import { PhraseTranslationPipe } from '../../quiz/pipes/phrase-translation-pipe';
import { CurrentLanguageService } from '../../services/current-language.service';
import { EmptyStateComponent, LoadingSpinnerComponent } from '../../shared/components';

@Component({
  selector: 'app-rules-view',
  imports: [
    RouterLink,
    TranslatePipe,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    FaIconComponent,
    PhraseTranslationPipe,
  ],
  templateUrl: './rules-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesViewComponent {
  readonly rules = input.required<Rule[]>();
  readonly loading = input.required<boolean>();
  readonly currentLanguage = inject(CurrentLanguageService).current;
  readonly faChevronRight = faChevronRight;
  readonly faFileAlt = faFileAlt;
}
