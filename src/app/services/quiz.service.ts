import { Injectable, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';

export interface QuizConfig {
  questionCount: number;
  timedMode: boolean;
  timePerQuestion: number; // in seconds
}

export interface QuizState {
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswers: Map<string, string[]>; // questionId -> answerIds[]
  timeRemaining: number; // in seconds
  isActive: boolean;
  isCompleted: boolean;
  timedMode: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  readonly config = signal<QuizConfig>({
    questionCount: 10,
    timedMode: false,
    timePerQuestion: 90,
  });

  readonly state = signal<QuizState>({
    currentQuestionIndex: 0,
    totalQuestions: 0,
    selectedAnswers: new Map(),
    timeRemaining: 0,
    isActive: false,
    isCompleted: false,
    timedMode: false,
  });

  private _timerSubscription?: Subscription;

  startQuiz(totalQuestions: number): void {
    const cfg = this.config();
    this.state.set({
      currentQuestionIndex: 0,
      totalQuestions,
      selectedAnswers: new Map(),
      timeRemaining: cfg.timedMode ? totalQuestions * cfg.timePerQuestion : 0,
      isActive: true,
      isCompleted: false,
      timedMode: cfg.timedMode,
    });

    if (cfg.timedMode) {
      this._startTimer();
    }
  }

  selectAnswer(questionId: string, answerId: string): void {
    const currentState = this.state();
    const answers = currentState.selectedAnswers.get(questionId) || [];
    
    if (!answers.includes(answerId)) {
      answers.push(answerId);
      currentState.selectedAnswers.set(questionId, answers);
      this.state.set({ ...currentState });
    }
  }

  deselectAnswer(questionId: string, answerId: string): void {
    const currentState = this.state();
    const answers = currentState.selectedAnswers.get(questionId) || [];
    
    const index = answers.indexOf(answerId);
    if (index > -1) {
      answers.splice(index, 1);
      currentState.selectedAnswers.set(questionId, answers);
      this.state.set({ ...currentState });
    }
  }

  nextQuestion(): void {
    const currentState = this.state();
    if (currentState.currentQuestionIndex < currentState.totalQuestions - 1) {
      this.state.set({
        ...currentState,
        currentQuestionIndex: currentState.currentQuestionIndex + 1,
      });
    }
  }

  previousQuestion(): void {
    const currentState = this.state();
    if (currentState.currentQuestionIndex > 0) {
      this.state.set({
        ...currentState,
        currentQuestionIndex: currentState.currentQuestionIndex - 1,
      });
    }
  }

  completeQuiz(): void {
    this._stopTimer();
    const currentState = this.state();
    this.state.set({
      ...currentState,
      isActive: false,
      isCompleted: true,
    });
  }

  resetQuiz(): void {
    this._stopTimer();
    this.state.set({
      currentQuestionIndex: 0,
      totalQuestions: 0,
      selectedAnswers: new Map(),
      timeRemaining: 0,
      isActive: false,
      isCompleted: false,
      timedMode: false,
    });
  }

  private _startTimer(): void {
    this._stopTimer();
    this._timerSubscription = interval(1000).subscribe(() => {
      const currentState = this.state();
      const newTime = currentState.timeRemaining - 1;
      
      if (newTime <= 0) {
        this.completeQuiz();
      } else {
        this.state.set({
          ...currentState,
          timeRemaining: newTime,
        });
      }
    });
  }

  private _stopTimer(): void {
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
      this._timerSubscription = undefined;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
