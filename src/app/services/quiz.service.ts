import { Injectable, signal, computed } from '@angular/core';
import { Question } from '../../../graphql/generated';

export interface Answer {
  id: string;
  number: string;
  phrase: string;
  isCorrect: boolean;
}

export interface QuizAnswer {
  questionId: string;
  questionNumber: string;
  selectedAnswerIds: string[];
}

export interface QuizQuestion {
  id: string;
  number: string;
  phrase: string;
  answers: Answer[];
  shuffledAnswers: Answer[];
}

export interface QuizConfig {
  questions: QuizQuestion[];
  totalQuestions: number;
  timedMode: boolean;
  timePerQuestion: number; // in seconds
  totalTime: number; // in seconds
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  isComplete: boolean;
  timeRemaining: number; // in seconds
  isTimerActive: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  answers: Array<{
    questionNumber: string;
    question: string;
    correctAnswerIds: string[];
    selectedAnswerIds: string[];
    isCorrect: boolean;
    allAnswers: Answer[];
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private timerInterval?: number;

  config = signal<QuizConfig | null>(null);
  state = signal<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false,
    timeRemaining: 0,
    isTimerActive: false,
  });

  currentQuestion = computed(() => {
    const cfg = this.config();
    const st = this.state();
    if (!cfg || st.currentQuestionIndex >= cfg.questions.length) {
      return null;
    }
    return cfg.questions[st.currentQuestionIndex];
  });

  progress = computed(() => {
    const cfg = this.config();
    const st = this.state();
    if (!cfg) return { current: 0, total: 0, percentage: 0 };
    return {
      current: st.currentQuestionIndex + 1,
      total: cfg.totalQuestions,
      percentage: ((st.currentQuestionIndex + 1) / cfg.totalQuestions) * 100,
    };
  });

  canGoNext = computed(() => {
    const st = this.state();
    const cfg = this.config();
    if (!cfg) return false;
    return st.currentQuestionIndex < cfg.totalQuestions - 1;
  });

  canGoPrevious = computed(() => {
    const st = this.state();
    return st.currentQuestionIndex > 0;
  });

  initializeQuiz(questions: Question[], timedMode: boolean, timePerQuestion: number = 90): void {
    // Convert Question[] to QuizQuestion[] and shuffle
    const quizQuestions: QuizQuestion[] = questions
      .map((q) => {
        const answers: Answer[] =
          q.answers?.nodes
            ?.filter((a) => a != null)
            .map((a) => ({
              id: a!.id,
              number: a!.number || '',
              phrase: a!.phrase || '',
              isCorrect: a!.isCorrect,
            })) || [];

        return {
          id: q.id,
          number: q.number || '',
          phrase: q.phrase || '',
          answers,
          shuffledAnswers: this.shuffleArray([...answers]),
        };
      })
      .filter((q) => q.answers.length > 0);

    // Shuffle questions
    const shuffled = this.shuffleArray(quizQuestions);

    const totalTime = timedMode ? shuffled.length * timePerQuestion : 0;

    this.config.set({
      questions: shuffled,
      totalQuestions: shuffled.length,
      timedMode,
      timePerQuestion,
      totalTime,
    });

    this.state.set({
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
      timeRemaining: totalTime,
      isTimerActive: timedMode,
    });

    if (timedMode) {
      this.startTimer();
    }
  }

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

  goToQuestion(index: number): void {
    const cfg = this.config();
    if (!cfg || index < 0 || index >= cfg.totalQuestions) return;

    this.state.update((s) => ({ ...s, currentQuestionIndex: index }));
  }

  nextQuestion(): void {
    if (this.canGoNext()) {
      this.state.update((s) => ({ ...s, currentQuestionIndex: s.currentQuestionIndex + 1 }));
    }
  }

  previousQuestion(): void {
    if (this.canGoPrevious()) {
      this.state.update((s) => ({ ...s, currentQuestionIndex: s.currentQuestionIndex - 1 }));
    }
  }

  getCurrentAnswerIds(): string[] {
    const st = this.state();
    const currentQ = this.currentQuestion();
    if (!currentQ) return [];

    const answer = st.answers.find((a) => a.questionId === currentQ.id);
    return answer ? answer.selectedAnswerIds : [];
  }

  completeQuiz(): QuizResult {
    this.stopTimer();
    this.state.update((s) => ({ ...s, isComplete: true, isTimerActive: false }));

    return this.calculateResults();
  }

  calculateResults(): QuizResult {
    const cfg = this.config();
    const st = this.state();
    if (!cfg) {
      return {
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        percentage: 0,
        answers: [],
      };
    }

    const results = cfg.questions.map((q) => {
      const userAnswer = st.answers.find((a) => a.questionId === q.id);
      const selectedAnswerIds = userAnswer ? userAnswer.selectedAnswerIds : [];
      const correctAnswerIds = q.answers.filter((a) => a.isCorrect).map((a) => a.id);

      // Check if answer is correct (must select all correct answers and no incorrect ones)
      const isCorrect =
        selectedAnswerIds.length === correctAnswerIds.length &&
        correctAnswerIds.every((id) => selectedAnswerIds.includes(id)) &&
        selectedAnswerIds.every((id) => correctAnswerIds.includes(id));

      return {
        questionNumber: q.number,
        question: q.phrase,
        correctAnswerIds,
        selectedAnswerIds,
        isCorrect,
        allAnswers: q.shuffledAnswers,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const wrongCount = results.length - correctCount;
    const percentage = results.length > 0 ? (correctCount / results.length) * 100 : 0;

    return {
      totalQuestions: cfg.totalQuestions,
      correctCount,
      wrongCount,
      percentage,
      answers: results,
    };
  }

  resetQuiz(): void {
    this.stopTimer();
    this.config.set(null);
    this.state.set({
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
      timeRemaining: 0,
      isTimerActive: false,
    });
  }

  private startTimer(): void {
    this.stopTimer();

    this.timerInterval = window.setInterval(() => {
      this.state.update((s) => {
        const newTime = s.timeRemaining - 1;
        if (newTime <= 0) {
          this.completeQuiz();
          return { ...s, timeRemaining: 0, isTimerActive: false };
        }
        return { ...s, timeRemaining: newTime };
      });
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get all question IDs and answer IDs for score calculation API
  getAllQuestionIds(): string[] {
    const cfg = this.config();
    return cfg ? cfg.questions.map((q) => q.id) : [];
  }

  getAllSelectedAnswerIds(): string[] {
    const st = this.state();
    return st.answers.flatMap((a) => a.selectedAnswerIds);
  }
}
