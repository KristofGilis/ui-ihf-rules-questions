import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Question } from '../../../graphql/generated';
import { QuestionsService } from '../questions/services/questions.service';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-quiz',
  imports: [TranslatePipe, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent {
  private readonly _router = inject(Router);
  private readonly _questionsService = inject(QuestionsService);
  readonly quizService = inject(QuizService);

  // Quiz configuration
  readonly questionCount = signal(10);
  readonly timedMode = signal(false);
  readonly timePerQuestion = signal(30);
  readonly showingResults = signal(false);

  // Current question data
  readonly currentQuestion = computed(() => {
    const questions = this.quizService.quizQuestions();
    const index = this.quizService.currentQuestionIndex();
    return questions[index];
  });

  readonly progress = computed(() => {
    const current = this.quizService.currentQuestionIndex() + 1;
    const total = this.quizService.quizQuestions().length;
    return { current, total };
  });

  readonly timeRemaining = computed(() => {
    const seconds = this.quizService.timeRemainingSeconds();
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  });

  readonly canGoNext = computed(() => {
    return this.quizService.currentQuestionIndex() < this.quizService.quizQuestions().length - 1;
  });

  readonly canGoPrevious = computed(() => {
    return this.quizService.currentQuestionIndex() > 0;
  });

  async startQuiz(): Promise<void> {
    // Fetch questions from service
    const result = await this._questionsService.fetchQuestions(this.questionCount());

    if (result && result.length > 0) {
      this.quizService.startQuiz(result, {
        questionCount: this.questionCount(),
        timedMode: this.timedMode(),
        timePerQuestionSeconds: this.timedMode() ? this.timePerQuestion() : undefined,
      });
    }
  }

  toggleAnswer(answerId: string): void {
    const currentIndex = this.quizService.currentQuestionIndex();
    const question = this.quizService.quizQuestions()[currentIndex];
    
    if (question.selectedAnswerIds.includes(answerId)) {
      this.quizService.deselectAnswer(currentIndex, answerId);
    } else {
      this.quizService.selectAnswer(currentIndex, answerId);
    }
  }

  isAnswerSelected(answerId: string): boolean {
    const question = this.currentQuestion();
    return question?.selectedAnswerIds.includes(answerId) ?? false;
  }

  nextQuestion(): void {
    this.quizService.nextQuestion();
  }

  previousQuestion(): void {
    this.quizService.previousQuestion();
  }

  finishQuiz(): void {
    this.quizService.finishQuiz();
    this.showingResults.set(true);
  }

  restartQuiz(): void {
    this.quizService.resetQuiz();
    this.showingResults.set(false);
  }

  exitQuiz(): void {
    this.quizService.resetQuiz();
    this._router.navigate(['/home']);
  }

  getAnswerClass(answer: any, isResult: boolean): string {
    if (!isResult) {
      return '';
    }

    const result = this.quizService.quizResult();
    if (!result) return '';

    const currentQ = this.currentQuestion();
    if (!currentQ) return '';

    const isCorrect = answer.isCorrect;
    const wasSelected = currentQ.selectedAnswerIds.includes(answer.id);

    if (isCorrect && wasSelected) {
      return 'correct-answer';
    } else if (isCorrect && !wasSelected) {
      return 'missed-answer';
    } else if (!isCorrect && wasSelected) {
      return 'wrong-answer';
    }
    return '';
  }

  isQuestionCorrect(question: any): boolean {
    const correctIds = question.answers.filter((a: any) => a?.isCorrect).map((a: any) => a!.id);
    const selectedIds = question.selectedAnswerIds;
    return correctIds.length === selectedIds.length && correctIds.every((id: string) => selectedIds.includes(id));
  }
}
