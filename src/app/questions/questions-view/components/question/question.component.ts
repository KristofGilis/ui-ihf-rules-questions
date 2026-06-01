import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Question } from '../../../../../../graphql/types';
import { PhraseTranslationPipe } from '../../../../quiz/pipes/phrase-translation-pipe';
import { CurrentLanguageService } from '../../../../services/current-language.service';

@Component({
  selector: 'app-question',
  imports: [FormsModule, FaIconComponent, TranslatePipe, PhraseTranslationPipe],
  templateUrl: './question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  readonly question = input.required<Question>();
  readonly isWrong = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();

  readonly elementRef = inject(ElementRef);
  readonly currentLanguage = inject(CurrentLanguageService).current;

  readonly faTimesCircle = faTimesCircle;

  onCheckboxChange(answerId: string, checked: boolean) {
    if (checked) {
      this.selectAnswer.emit(answerId);
    } else {
      this.deselectAnswer.emit(answerId);
    }
  }
}
