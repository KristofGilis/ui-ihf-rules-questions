import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { CalculateScoreGQL } from '../../../../graphql/generated';
import { Question, Score } from '../../../../graphql/types';
import { QUIZ_CONFIG } from '../../constants';
import { ConnectivityService } from '../../services/connectivity.service';
import { parseTranslations } from '../pipes/parse-translations.function';
import { LocalScoreService } from './local-score.service';
import { createSeed, mulberry32, shuffle } from './seeded-rng';

/**
 * Internal types - not exported as they're only used within this service
 */

/** Represents a single answer option for a question */
interface Answer {
  id: string;
  number: string;
  phrase: string;
  translations: Record<string, string>; // JSON string of translations
}

/** Represents a user's answer to a specific question */
interface QuizAnswer {
  questionId: string;
  questionNumber: string;
  selectedAnswerIds: string[];
}

/** Represents a quiz question with both original and shuffled answer orders */
interface QuizQuestion {
  id: string;
  number: string;
  phrase: string;
  translations: Record<string, string>; // JSON string of translations
  answers: Answer[]; // Original unshuffled answers
  shuffledAnswers: Answer[]; // Randomized order shown to user
}

/** Configuration for a quiz session */
interface QuizConfig {
  questions: QuizQuestion[];
  totalQuestions: number;
  timedMode: boolean;
  timePerQuestion: number; // seconds
  totalTime: number; // seconds
  /** Seed used to drive the deterministic Fisher–Yates shuffle (reproducibility). */
  seed: number;
}

/** Current state of an active quiz session */
interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  isComplete: boolean;
  timeRemaining: number; // seconds
  isTimerActive: boolean;
  startTime?: number; // Timestamp when quiz started
}

/** Results of a completed quiz */
interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  completionTimeSeconds?: number; // Time taken to complete quiz
  answers: Array<{
    questionNumber: string;
    question: string;
    selectedAnswerIds: string[];
    isCorrect: boolean;
    allAnswers: Answer[]; // Shuffled answers as shown during quiz
  }>;
}

/**
 * Service for managing quiz functionality including:
 * - Quiz initialization with question/answer shuffling
 * - Navigation between questions
 * - Answer tracking
 * - Timer management for timed mode
 * - Score calculation via backend API
 * - Navigation to results page
 */

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly _calculateScoreGQL = inject(CalculateScoreGQL);
  private readonly _localScore = inject(LocalScoreService);
  private readonly _connectivity = inject(ConnectivityService);
  private readonly _router = inject(Router);
  private _timerInterval?: number;

  /**
   * State Signals
   */

  /** Quiz configuration including questions and timing settings */
  readonly config = signal<QuizConfig | null>(null);

  /** Current quiz state including progress and answers */
  readonly state = signal<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false,
    timeRemaining: 0,
    isTimerActive: false,
    startTime: undefined,
  });

  /** Results of the completed quiz */
  readonly results = signal<QuizResult | null>(null);

  /**
   * Computed Values
   */

  /** Current question being displayed, or null if quiz not started/completed */
  readonly currentQuestion = computed(() => {
    const cfg = this.config();
    const st = this.state();
    if (!cfg || st.currentQuestionIndex >= cfg.questions.length) {
      return null;
    }
    return cfg.questions[st.currentQuestionIndex];
  });

  /** Progress information: current question number, total, and percentage */
  readonly progress = computed(() => {
    const cfg = this.config();
    const st = this.state();
    if (!cfg) return { current: 0, total: 0, percentage: 0 };
    return {
      current: st.currentQuestionIndex + 1,
      total: cfg.totalQuestions,
      percentage: ((st.currentQuestionIndex + 1) / cfg.totalQuestions) * 100,
    };
  });

  /** Whether navigation to next question is possible */
  readonly canGoNext = computed(() => {
    const st = this.state();
    const cfg = this.config();
    return cfg ? st.currentQuestionIndex < cfg.totalQuestions - 1 : false;
  });

  /** Whether navigation to previous question is possible */
  readonly canGoPrevious = computed(() => this.state().currentQuestionIndex > 0);

  /**
   * Quiz Initialization
   */

  /**
   * Initialize a new quiz session with shuffled questions and answers.
   * Clears any previous results and sets up timer if in timed mode.
   *
   * @param questions - Array of questions from GraphQL API
   * @param timedMode - Whether to enable countdown timer
   * @param timePerQuestion - Seconds allowed per question (default from QUIZ_CONFIG)
   */
  initializeQuiz(
    questions: Question[],
    timedMode: boolean,
    timePerQuestion: number = QUIZ_CONFIG.TIME_PER_QUESTION,
    seed: number = createSeed()
  ): void {
    // Clear any previous results when starting a new quiz
    this.results.set(null);

    // Single shared RNG so question + answer shuffles are reproducible from
    // the seed alone.
    const rng = mulberry32(seed);

    // Convert Question[] to QuizQuestion[] and shuffle
    const quizQuestions: QuizQuestion[] = questions
      .filter((q) => q !== null)
      .map((q) => {
        const answers: Answer[] =
          q.answers?.nodes
            ?.filter((a) => a !== null)
            ?.map((a) => ({
              id: a.id,
              number: a.number ?? '',
              phrase: a.phrase ?? '',
              translations: parseTranslations(a.translations as string | Record<string, string> | null | undefined),
            })) || [];

        return {
          id: q.id,
          number: q.number || '',
          phrase: q.phrase || '',
          translations: parseTranslations(
            ('translations' in q ? (q.translations as string | Record<string, string> | null | undefined) : null) ??
              undefined
          ),
          answers,
          shuffledAnswers: shuffle([...answers], rng),
        };
      })
      .filter((q) => q.answers.length > 0);

    // Shuffle questions
    const shuffled = shuffle(quizQuestions, rng);

    const totalTime = timedMode ? shuffled.length * timePerQuestion : 0;

    this.config.set({
      questions: shuffled,
      totalQuestions: shuffled.length,
      timedMode,
      timePerQuestion,
      totalTime,
      seed,
    });

    this.state.set({
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
      timeRemaining: totalTime,
      isTimerActive: timedMode,
      startTime: timedMode ? Date.now() : undefined,
    });

    // Performance mark: Quiz started
    if (typeof performance !== 'undefined') {
      performance.mark('quiz-start');
    }

    if (timedMode) {
      this.startTimer();
    }
  }

  /**
   * Record answer(s) for the current question.
   * Updates or creates answer entry for the current question.
   *
   * @param selectedAnswerIds - Array of selected answer IDs
   */
  answerCurrentQuestion(selectedAnswerIds: string[]): void {
    const cfg = this.config();
    const st = this.state();
    if (!cfg || st.isComplete) return;

    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answer: QuizAnswer = {
      questionId: currentQ.id,
      questionNumber: currentQ.number,
      selectedAnswerIds: [...selectedAnswerIds],
    };

    // Update or add answer
    const existingIndex = st.answers.findIndex((a) => a.questionId === currentQ.id);
    const newAnswers = [...st.answers];
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = answer;
    } else {
      newAnswers.push(answer);
    }

    this.state.update((s) => ({ ...s, answers: newAnswers }));
  }

  /**
   * Navigation
   */

  /** Move to the next question if available */
  nextQuestion(): void {
    if (this.canGoNext()) {
      this.state.update((s) => ({ ...s, currentQuestionIndex: s.currentQuestionIndex + 1 }));
    }
  }

  /** Move to the previous question if available */
  previousQuestion(): void {
    if (this.canGoPrevious()) {
      this.state.update((s) => ({ ...s, currentQuestionIndex: s.currentQuestionIndex - 1 }));
    }
  }

  /**
   * Answer Management
   */

  /**
   * Get the answer IDs selected for the current question.
   * @returns Array of selected answer IDs, or empty array if none selected
   */
  getCurrentAnswerIds(): string[] {
    const currentQ = this.currentQuestion();
    if (!currentQ) return [];
    const answer = this.state().answers.find((a) => a.questionId === currentQ.id);
    return answer?.selectedAnswerIds ?? [];
  }

  /**
   * Quiz Completion and Scoring
   */

  /**
   * Complete the quiz and calculate the score via backend API.
   * Stops timer, marks quiz as complete, calls GraphQL API to calculate score,
   * stores results, and navigates to results page.
   *
   * @returns Observable with loading state and quiz results
   */
  completeQuiz(): Observable<{ loading: boolean; result: QuizResult | undefined }> {
    this.stopTimer();

    // Update state first
    this.state.update((s) => ({ ...s, isComplete: true, isTimerActive: false }));

    // Get all question and answer IDs
    const questionIds = this.getAllQuestionIds();
    const selectedAnswerIds = this.getAllSelectedAnswerIds();

    // Branch: when offline, score locally from the cached configuration +
    // answers; when online, defer to the backend. Both branches emit the
    // same `{ loading, result }` shape so downstream consumers (and the
    // results page) don't need to care which source produced the score.
    const score$: Observable<{ loading: boolean; score: Score | null | undefined }> = this._connectivity.online
      ? this._calculateScoreGQL
          .watch({
            variables: { questionIds, selectedAnswerIds },
            fetchPolicy: 'no-cache',
          })
          .valueChanges.pipe(
            map((response) => ({
              loading: response.loading,
              score: response.data?.calculateScore as Score | null | undefined,
            })),
            // Fall back to the local scorer on network errors so the user can
            // still see results when the server is unreachable mid-quiz.
            catchError(() =>
              this._localScore
                .calculateScore(questionIds, selectedAnswerIds)
                .pipe(map((s) => ({ loading: false, score: s })))
            )
          )
      : this._localScore
          .calculateScore(questionIds, selectedAnswerIds)
          .pipe(map((s) => ({ loading: false, score: s })));

    return score$.pipe(
      map(({ loading, score }) => {
        if (loading) {
          return { loading, result: undefined };
        }

        const cfg = this.config();
        const st = this.state();

        if (!cfg || !score) {
          const emptyResult: QuizResult = {
            totalQuestions: 0,
            correctCount: 0,
            wrongCount: 0,
            percentage: 0,
            answers: [],
          };
          this.results.set(emptyResult);
          return { loading, result: cfg && score ? emptyResult : undefined };
        }

        // Map the score results to our quiz format
        const wrongQuestionIds = new Set(score.wrongQuestionsIds);
        const results = cfg.questions.map((q) => {
          const userAnswer = st.answers.find((a) => a.questionId === q.id);
          const selectedIds = userAnswer ? userAnswer.selectedAnswerIds : [];

          // Question is correct if it's NOT in the wrong questions list
          const isCorrect = !wrongQuestionIds.has(q.id);

          return {
            questionNumber: q.number,
            question: q.phrase,
            selectedAnswerIds: selectedIds,
            isCorrect,
            allAnswers: q.shuffledAnswers,
          };
        });

        const total = score.total ?? cfg.totalQuestions;
        const correctCount = score.score ?? 0;
        const wrongCount = total - correctCount;
        const percentage = score.percentage ? parseFloat(score.percentage) : 0;

        // Calculate completion time
        const completionTimeSeconds = st.startTime ? Math.floor((Date.now() - st.startTime) / 1000) : undefined;

        const result: QuizResult = {
          totalQuestions: total,
          correctCount,
          wrongCount,
          percentage,
          completionTimeSeconds,
          answers: results,
        };

        // Performance mark: Quiz completed
        if (typeof performance !== 'undefined') {
          performance.mark('quiz-complete');
          performance.measure('quiz-duration', 'quiz-start', 'quiz-complete');
        }

        this.results.set(result);
        return { loading, result };
      }),
      tap((state) => {
        // Navigate to results when loading is complete
        if (!state.loading && state.result) {
          this._router.navigate(['/quiz/results']);
        }
      })
    );
  }

  /**
   * Reset quiz state to initial values.
   * Stops timer and clears all configuration, state, and results.
   */
  resetQuiz(): void {
    this.stopTimer();
    this.config.set(null);
    this.state.set({
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
      timeRemaining: 0,
      isTimerActive: false,
      startTime: undefined,
    });
    this.results.set(null);
  }

  /**
   * Timer Management
   */

  /**
   * Start the countdown timer for timed mode.
   * Decrements timeRemaining every second and auto-completes quiz when time expires.
   */
  private startTimer(): void {
    this.stopTimer();
    this._timerInterval = window.setInterval(() => {
      this.state.update((s) => {
        const newTime = s.timeRemaining - 1;
        if (newTime <= 0) {
          this.completeQuiz().subscribe();
          return { ...s, timeRemaining: 0, isTimerActive: false };
        }
        return { ...s, timeRemaining: newTime };
      });
    }, 1000);
  }

  /** Stop the countdown timer if running */
  private stopTimer(): void {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = undefined;
    }
  }

  /**
   * Utilities
   */

  /**
   * Format seconds into MM:SS display format.
   * @param seconds - Number of seconds to format
   * @returns Formatted time string (e.g., "5:03")
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format completion time into a readable string.
   * @param seconds - Number of seconds to format
   * @returns Formatted time string (e.g., "5m 3s" or "45s")
   */
  formatCompletionTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Shuffle array using Fisher–Yates algorithm with a non-deterministic RNG.
   * Kept for callers that don't need reproducibility; quiz initialization uses
   * the seeded `shuffle` helper instead.
   */
  private shuffleArray<T>(array: T[]): T[] {
    return shuffle(array, Math.random);
  }

  /**
   * Get all question IDs from current quiz configuration.
   * @returns Array of question IDs, or empty array if no quiz active
   */
  private getAllQuestionIds(): string[] {
    return this.config()?.questions.map((q) => q.id) ?? [];
  }

  /**
   * Get all selected answer IDs from all answered questions.
   * @returns Flat array of all selected answer IDs
   */
  private getAllSelectedAnswerIds(): string[] {
    return this.state().answers.flatMap((a) => a.selectedAnswerIds);
  }
}
