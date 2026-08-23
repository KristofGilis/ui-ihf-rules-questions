import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faEye, faEyeSlash, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Question } from '../../../../../../graphql/types';
import { PhraseTranslationPipe } from '../../../../quiz/pipes/phrase-translation-pipe';
import { CurrentLanguageService } from '../../../../services/current-language.service';

// Rows scrolled far outside this margin are detached from CD; large lists (400+ mounted
// rows) otherwise pay a full re-render for every row whenever a shared input (e.g. the
// global reveal toggle) changes on all of them at once.
const OFFSCREEN_ROOT_MARGIN = '600px 0px';

@Component({
  selector: 'app-question',
  imports: [FormsModule, FaIconComponent, TranslatePipe, PhraseTranslationPipe],
  templateUrl: './question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent implements OnInit {
  readonly question = input.required<Question>();
  readonly isWrong = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly revealed = input<boolean>(false);
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();
  readonly toggleReveal = output<void>();

  readonly elementRef = inject(ElementRef);
  readonly currentLanguage = inject(CurrentLanguageService).current;

  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private attached = true;

  readonly faTimesCircle = faTimesCircle;
  readonly faCheckCircle = faCheckCircle;
  readonly faEye = faEye;
  readonly faEyeSlash = faEyeSlash;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!this.attached) {
            this.attached = true;
            this.cdRef.reattach();
            this.cdRef.detectChanges();
          }
        } else if (this.attached) {
          this.attached = false;
          this.cdRef.detach();
        }
      },
      { rootMargin: OFFSCREEN_ROOT_MARGIN }
    );
    observer.observe(this.elementRef.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  onCheckboxChange(answerId: string, checked: boolean) {
    if (checked) {
      this.selectAnswer.emit(answerId);
    } else {
      this.deselectAnswer.emit(answerId);
    }
  }
}
