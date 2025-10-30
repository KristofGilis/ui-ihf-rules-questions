import { Injectable, signal } from '@angular/core';
import { Answer, Question } from '../../../graphql/generated';

export interface QuizQuestion {
  question: Question;
  answers: (Answer | null)[];
  selectedAnswerIds: string[];
}

export interface QuizConfig {
  questionCount: number;
  timedMode: boolean;
  timePerQuestionSeconds?: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  questions: QuizQuestion[];
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  readonly currentQuestionIndex = signal<number>(0);
  readonly quizQuestions = signal<QuizQuestion[]>([]);
  readonly isQuizActive = signal<boolean>(false);
  readonly timedMode = signal<boolean>(false);
  readonly timeRemainingSeconds = signal<number>(0);
  readonly quizResult = signal<QuizResult | null>(null);

  private _timerInterval?: ReturnType<typeof setInterval>;

  startQuiz(questions: Question[], config: QuizConfig): void {
    // Shuffle questions
    const shuffledQuestions = this._shuffleArray([...questions]).slice(0, config.questionCount);

    // Shuffle answers for each question
    const quizQuestions: QuizQuestion[] = shuffledQuestions.map((q) => ({
      question: q,
      answers: this._shuffleArray([...(q.answers?.nodes ?? [])]),
      selectedAnswerIds: [],
    }));

    this.quizQuestions.set(quizQuestions);
    this.currentQuestionIndex.set(0);
    this.isQuizActive.set(true);
    this.timedMode.set(config.timedMode);
    this.quizResult.set(null);

    if (config.timedMode && config.timePerQuestionSeconds) {
      this._startTimer(config.timePerQuestionSeconds * config.questionCount);
    }
  }

  selectAnswer(questionIndex: number, answerId: string): void {
    const questions = [...this.quizQuestions()];
    const question = questions[questionIndex];
    if (!question.selectedAnswerIds.includes(answerId)) {
      question.selectedAnswerIds.push(answerId);
      this.quizQuestions.set(questions);
    }
  }

  deselectAnswer(questionIndex: number, answerId: string): void {
    const questions = [...this.quizQuestions()];
    const question = questions[questionIndex];
    const index = question.selectedAnswerIds.indexOf(answerId);
    if (index > -1) {
      question.selectedAnswerIds.splice(index, 1);
      this.quizQuestions.set(questions);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex() < this.quizQuestions().length - 1) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() - 1);
    }
  }

  finishQuiz(): QuizResult {
    this._stopTimer();
    this.isQuizActive.set(false);

    const questions = this.quizQuestions();
    let correctAnswers = 0;

    questions.forEach((quizQuestion) => {
      const correctAnswerIds = quizQuestion.answers
        .filter((a) => a?.isCorrect)
        .map((a) => a!.id);
      const selectedIds = quizQuestion.selectedAnswerIds;

      // Check if answer is correct (all correct answers selected, no incorrect ones)
      const isCorrect =
        correctAnswerIds.length === selectedIds.length &&
        correctAnswerIds.every((id) => selectedIds.includes(id));

      if (isCorrect) {
        correctAnswers++;
      }
    });

    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers: questions.length - correctAnswers,
      percentage: Math.round((correctAnswers / questions.length) * 100),
      questions,
    };

    this.quizResult.set(result);
    return result;
  }

  resetQuiz(): void {
    this._stopTimer();
    this.quizQuestions.set([]);
    this.currentQuestionIndex.set(0);
    this.isQuizActive.set(false);
    this.timedMode.set(false);
    this.timeRemainingSeconds.set(0);
    this.quizResult.set(null);
  }

  private _startTimer(totalSeconds: number): void {
    this.timeRemainingSeconds.set(totalSeconds);

    this._timerInterval = setInterval(() => {
      const remaining = this.timeRemainingSeconds();
      if (remaining <= 0) {
        this.finishQuiz();
      } else {
        this.timeRemainingSeconds.set(remaining - 1);
      }
    }, 1000);
  }

  private _stopTimer(): void {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = undefined;
    }
  }

  private _shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
