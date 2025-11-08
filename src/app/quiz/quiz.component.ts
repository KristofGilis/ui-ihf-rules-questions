import { AsyncPipe } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { GetQuestionsGQL, Question } from '../../../graphql/generated';
import { GradientButtonComponent, LoadingSpinnerComponent, PageContainerComponent } from '../shared/components';
import { ConfirmationDialogService } from '../shared/services/confirmation-dialog.service';
import { QuizService } from './services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslatePipe,
    FaIconComponent,
    PageContainerComponent,
    GradientButtonComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './quiz.component.html',
})
export class QuizComponent {
  private readonly _router = inject(Router);
  private readonly _getQuestionsGQL = inject(GetQuestionsGQL);
  private readonly _confirmationDialog = inject(ConfirmationDialogService);
  private readonly _translate = inject(TranslateService);
  readonly quizService = inject(QuizService);

  readonly faClock = faClock;
  readonly faArrowLeft = faArrowLeft;
  readonly faArrowRight = faArrowRight;
  readonly faCheck = faCheck;

  completingQuiz$?: Observable<{ loading: boolean }>;

  private readonly _navigationState = this._router.currentNavigation()?.extras.state;
  private readonly _count = this._navigationState?.['count'] || 10;
  private readonly _timed = this._navigationState?.['timed'] === true;

  readonly questions$: Observable<Question[]> = this._getQuestionsGQL
    .watch({
      variables: {
        first: this._count,
        random: true,
      },
      fetchPolicy: 'no-cache',
    })
    .valueChanges.pipe(
      map((result) => {
        if (!result.data) {
          return [];
        }
        const questions = result.data.questions?.edges?.map((edge) => edge?.node as Question) || [];
        if (questions.length > 0 && !this.quizService.config()) {
          this.quizService.initializeQuiz(questions, this._timed);
        }
        return questions;
      })
    );

  selectedAnswers: Set<string> = new Set();

  canDeactivate(): Observable<boolean> | boolean {
    const state = this.quizService.state();
    // Allow navigation if quiz is complete, not initialized, or on the first question
    if (state.isComplete || !this.quizService.config() || state.currentQuestionIndex === 0) {
      return true;
    }

    // Show confirmation dialog with translated text
    return this._confirmationDialog.confirm({
      title: this._translate.instant('quiz.leave_title'),
      message: this._translate.instant('quiz.leave_warning'),
      confirmText: this._translate.instant('quiz.leave_confirm'),
      cancelText: this._translate.instant('quiz.leave_cancel'),
    });
  }

  toggleAnswer(answerId: string) {
    if (this.selectedAnswers.has(answerId)) {
      this.selectedAnswers.delete(answerId);
    } else {
      this.selectedAnswers.add(answerId);
    }
    this.quizService.answerCurrentQuestion(Array.from(this.selectedAnswers));
  }

  goToNext() {
    this.quizService.nextQuestion();
    this.loadCurrentAnswers();
  }

  goToPrevious() {
    this.quizService.previousQuestion();
    this.loadCurrentAnswers();
  }

  completeQuiz() {
    this.completingQuiz$ = this.quizService.completeQuiz().pipe(map((state) => ({ loading: state.loading })));
  }

  formatTime(seconds: number): string {
    return this.quizService.formatTime(seconds);
  }

  /**
   * Keyboard shortcuts for quiz navigation
   * Arrow Left: Previous question
   * Arrow Right: Next question
   * Enter: Complete quiz (if on last question)
   */
  @HostListener('document:keydown.arrowleft', ['$event'])
  onArrowLeft(event: Event) {
    const keyEvent = event as KeyboardEvent;
    // Only handle if not in an input field
    if (this.isInputElement(keyEvent.target)) return;

    if (this.quizService.canGoPrevious()) {
      keyEvent.preventDefault();
      this.goToPrevious();
    }
  }

  @HostListener('document:keydown.arrowright', ['$event'])
  onArrowRight(event: Event) {
    const keyEvent = event as KeyboardEvent;
    // Only handle if not in an input field
    if (this.isInputElement(keyEvent.target)) return;

    if (this.quizService.canGoNext()) {
      keyEvent.preventDefault();
      this.goToNext();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: Event) {
    const keyEvent = event as KeyboardEvent;
    // Only handle if not in an input/button/link
    if (this.isInteractiveElement(keyEvent.target)) return;

    if (!this.quizService.canGoNext()) {
      keyEvent.preventDefault();
      this.completeQuiz();
    }
  }

  private isInputElement(target: EventTarget | null): boolean {
    const element = target as HTMLElement;
    return element?.tagName === 'INPUT' || element?.tagName === 'TEXTAREA';
  }

  private isInteractiveElement(target: EventTarget | null): boolean {
    const element = target as HTMLElement;
    return (
      element?.tagName === 'INPUT' ||
      element?.tagName === 'TEXTAREA' ||
      element?.tagName === 'BUTTON' ||
      element?.tagName === 'A'
    );
  }

  private loadCurrentAnswers() {
    const currentAnswers = this.quizService.getCurrentAnswerIds();
    this.selectedAnswers = new Set(currentAnswers);
  }
}
