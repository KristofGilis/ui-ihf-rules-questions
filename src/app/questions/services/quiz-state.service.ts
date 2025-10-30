import { Injectable, signal, computed } from '@angular/core';
import { Question } from '../../../graphql/generated';

export interface QuizConfig {
  timedMode: boolean;
  timePerQuestion: number; // in seconds
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
}

export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: Map<string, string[]>; // questionId -> answerIds[]
  startTime: number;
  questionStartTimes: Map<number, number>; // questionIndex -> startTime
  config: QuizConfig;
  isComplete: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  timeTaken: number; // in seconds
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  question: Question;
  selectedAnswerIds: string[];
  correctAnswerIds: string[];
  isCorrect: boolean;
  timeTaken: number; // in seconds
}

@Injectable({
  providedIn: 'root',
})
export class QuizStateService {
  private readonly _session = signal<QuizSession | null>(null);
  private readonly _timeRemaining = signal<number>(0);
  private _timer: ReturnType<typeof setInterval> | null = null;

  readonly session = this._session.asReadonly();
  readonly timeRemaining = this._timeRemaining.asReadonly();

  readonly currentQuestion = computed(() => {
    const session = this._session();
    if (!session || session.currentQuestionIndex >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentQuestionIndex];
  });

  readonly progress = computed(() => {
    const session = this._session();
    if (!session) {
      return { current: 0, total: 0, percentage: 0 };
    }
    return {
      current: session.currentQuestionIndex + 1,
      total: session.questions.length,
      percentage: ((session.currentQuestionIndex + 1) / session.questions.length) * 100,
    };
  });

  readonly isTimedMode = computed(() => this._session()?.config.timedMode ?? false);

  startQuiz(questions: Question[], config: QuizConfig): void {
    let processedQuestions = [...questions];

    // Randomize questions if enabled
    if (config.randomizeQuestions) {
      processedQuestions = this.shuffleArray(processedQuestions);
    }

    // Randomize answers for each question if enabled
    if (config.randomizeAnswers) {
      processedQuestions = processedQuestions.map((q) => ({
        ...q,
        answers: q.answers
          ? {
              ...q.answers,
              edges: this.shuffleArray([...(q.answers.edges || [])]),
            }
          : q.answers,
      }));
    }

    const newSession: QuizSession = {
      questions: processedQuestions,
      currentQuestionIndex: 0,
      selectedAnswers: new Map(),
      startTime: Date.now(),
      questionStartTimes: new Map([[0, Date.now()]]),
      config,
      isComplete: false,
    };

    this._session.set(newSession);

    if (config.timedMode) {
      this.startTimer(config.timePerQuestion);
    }
  }

  selectAnswer(questionId: string, answerId: string): void {
    const session = this._session();
    if (!session || session.isComplete) return;

    const currentAnswers = session.selectedAnswers.get(questionId) || [];
    
    // Toggle answer selection
    if (currentAnswers.includes(answerId)) {
      session.selectedAnswers.set(
        questionId,
        currentAnswers.filter((id) => id !== answerId)
      );
    } else {
      session.selectedAnswers.set(questionId, [...currentAnswers, answerId]);
    }

    this._session.set({ ...session });
  }

  nextQuestion(): void {
    const session = this._session();
    if (!session || session.isComplete) return;

    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex >= session.questions.length) {
      this.completeQuiz();
      return;
    }

    session.currentQuestionIndex = nextIndex;
    session.questionStartTimes.set(nextIndex, Date.now());
    this._session.set({ ...session });

    if (session.config.timedMode) {
      this.startTimer(session.config.timePerQuestion);
    }
  }

  previousQuestion(): void {
    const session = this._session();
    if (!session || session.currentQuestionIndex === 0) return;

    session.currentQuestionIndex--;
    this._session.set({ ...session });

    if (session.config.timedMode) {
      this.startTimer(session.config.timePerQuestion);
    }
  }

  completeQuiz(): void {
    const session = this._session();
    if (!session) return;

    this.stopTimer();
    session.isComplete = true;
    this._session.set({ ...session });
  }

  calculateResults(): QuizResult | null {
    const session = this._session();
    if (!session || !session.isComplete) return null;

    const questionResults: QuestionResult[] = [];
    let correctCount = 0;

    for (let i = 0; i < session.questions.length; i++) {
      const question = session.questions[i];
      const selectedAnswerIds = session.selectedAnswers.get(question.id) || [];
      
      const correctAnswerIds = 
        question.answers?.edges
          ?.filter((edge) => edge?.node?.isCorrect)
          .map((edge) => edge!.node!.id) || [];

      const isCorrect = this.areAnswersCorrect(selectedAnswerIds, correctAnswerIds);
      
      if (isCorrect) {
        correctCount++;
      }

      const startTime = session.questionStartTimes.get(i) || session.startTime;
      const endTime = session.questionStartTimes.get(i + 1) || Date.now();
      const timeTaken = (endTime - startTime) / 1000;

      questionResults.push({
        question,
        selectedAnswerIds,
        correctAnswerIds,
        isCorrect,
        timeTaken,
      });
    }

    const totalTime = (Date.now() - session.startTime) / 1000;

    return {
      totalQuestions: session.questions.length,
      correctAnswers: correctCount,
      wrongAnswers: session.questions.length - correctCount,
      percentage: (correctCount / session.questions.length) * 100,
      timeTaken: totalTime,
      questionResults,
    };
  }

  resetQuiz(): void {
    this.stopTimer();
    this._session.set(null);
    this._timeRemaining.set(0);
  }

  private areAnswersCorrect(selected: string[], correct: string[]): boolean {
    if (selected.length !== correct.length) return false;
    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...correct].sort();
    return sortedSelected.every((id, index) => id === sortedCorrect[index]);
  }

  private startTimer(seconds: number): void {
    this.stopTimer();
    this._timeRemaining.set(seconds);

    this._timer = setInterval(() => {
      const remaining = this._timeRemaining();
      if (remaining <= 0) {
        this.stopTimer();
        this.nextQuestion(); // Auto-advance when time runs out
      } else {
        this._timeRemaining.set(remaining - 1);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
