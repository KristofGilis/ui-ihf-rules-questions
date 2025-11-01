import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Capacitor } from '@capacitor/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartBar, faQuestionCircle, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { fromEvent, map, of, startWith } from 'rxjs';
import { Question, Score } from '../../../../graphql/generated';
import {
  EmptyStateComponent,
  GradientButtonComponent,
  LoadingSpinnerComponent,
  MobileDialogComponent,
} from '../../shared/components';
import { QuestionComponent } from './components/question/question.component';
import { ScoreOverviewComponent } from './components/score-overview/score-overview.component';

@Component({
  selector: 'app-questions-view',
  imports: [
    CommonModule,
    QuestionComponent,
    TranslatePipe,
    ScoreOverviewComponent,
    FontAwesomeModule,
    EmptyStateComponent,
    GradientButtonComponent,
    MobileDialogComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './questions-view.component.html',
  styleUrl: './questions-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsViewComponent {
  readonly questions = input.required<Question[]>();
  readonly loading = input.required<boolean>();
  readonly hasMoreQuestions = input.required<boolean>();
  readonly score = input.required<Score | undefined>();
  readonly scoreLoading = input.required<boolean>();
  readonly calculareScore = output<{
    questionIds: string[];
    selectedAnswerIds: string[];
  }>();

  readonly questionComponents = viewChildren(QuestionComponent);

  readonly faSpinner = faSpinner;
  readonly faChartBar = faChartBar;
  readonly faRotateRight = faRotateRight;
  readonly faQuestionCircle = faQuestionCircle;

  readonly selectedAnswers = signal<string[]>([]);
  readonly showMobileScoreDialog = signal(false);
  private savedScrollY = 0;

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  // Check if running on native mobile platform or small screen
  readonly isMobile = toSignal(
    isPlatformBrowser(this.platformId)
      ? fromEvent<MediaQueryListEvent>(window.matchMedia('(max-width: 1023px)'), 'change').pipe(
          map((e) => e.matches || Capacitor.isNativePlatform()),
          startWith(window.matchMedia('(max-width: 1023px)').matches || Capacitor.isNativePlatform())
        )
      : of(false), // Server-side: treat as desktop
    {
      initialValue:
        isPlatformBrowser(this.platformId) &&
        (window.matchMedia('(max-width: 1023px)').matches || Capacitor.isNativePlatform()),
    }
  );

  constructor() {
    // Lock body scroll when mobile dialog is open (only on mobile/native, not desktop)
    effect(() => {
      if (this.showMobileScoreDialog() && this.score() && this.isMobile()) {
        // Save current scroll position before locking
        this.savedScrollY = window.scrollY;
        this.document.body.style.position = 'fixed';
        this.document.body.style.top = `-${this.savedScrollY}px`;
        this.document.body.style.width = '100%';
      } else {
        // Restore scroll position
        this.document.body.style.position = '';
        this.document.body.style.top = '';
        this.document.body.style.width = '';
        if (this.savedScrollY) {
          window.scrollTo(0, this.savedScrollY);
          this.savedScrollY = 0;
        }
      }
    });

    // Auto-open dialog when score is calculated on mobile (with delay to avoid scroll jump)
    effect(() => {
      const score = this.score();
      const isMobile = this.isMobile();

      if (score && isMobile) {
        // Delay opening to ensure scroll position is stable
        setTimeout(() => {
          this.showMobileScoreDialog.set(true);
        }, 100);
      }
    });
  }
  onSelectAnswer(id: string): void {
    this.selectedAnswers.update((answers) => [...answers, id]);
  }

  onDeselectAnswer(id: string): void {
    this.selectedAnswers.update((answers) => answers.filter((answerId) => answerId !== id));
  }

  onCalculateScore(): void {
    if (!this.hasMoreQuestions()) {
      this.calculareScore.emit({
        questionIds: this.questions().map((x) => x.id),
        selectedAnswerIds: this.selectedAnswers(),
      });
    }
  }

  isQuestionWrong(questionId: string): boolean {
    return this.score()?.wrongQuestionsIds?.includes(questionId) ?? false;
  }

  scrollToQuestion(questionId: string): void {
    const questionComponent = this.questionComponents().find((comp) => comp.question().id === questionId);
    if (questionComponent) {
      // Close mobile dialog first to unlock scroll
      this.showMobileScoreDialog.set(false);

      // Wait for dialog to close and body scroll to unlock before scrolling
      setTimeout(() => {
        questionComponent.elementRef.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }

  toggleMobileScoreDialog(): void {
    this.showMobileScoreDialog.update((show) => !show);
  }

  closeMobileScoreDialog(): void {
    this.showMobileScoreDialog.set(false);
  }
}
