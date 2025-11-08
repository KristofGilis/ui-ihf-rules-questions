import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as Hammer from 'hammerjs';
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
export class QuizComponent implements OnInit, OnDestroy {
  private readonly _router = inject(Router);
  private readonly _getQuestionsGQL = inject(GetQuestionsGQL);
  private readonly _confirmationDialog = inject(ConfirmationDialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _elementRef = inject(ElementRef);
  readonly quizService = inject(QuizService);

  private _hammer?: HammerManager;

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

  ngOnInit(): void {
    // Initialize Hammer.js for swipe gestures
    const element = this._elementRef.nativeElement;
    this._hammer = new Hammer.Manager(element);

    // Configure swipe recognizer
    const swipe = new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL });
    this._hammer.add(swipe);

    // Listen for swipe events
    this._hammer.on('swipeleft', () => {
      if (this.quizService.canGoNext()) {
        this.goToNext();
      }
    });

    this._hammer.on('swiperight', () => {
      if (this.quizService.canGoPrevious()) {
        this.goToPrevious();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up Hammer.js instance
    if (this._hammer) {
      this._hammer.destroy();
    }
  }

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
