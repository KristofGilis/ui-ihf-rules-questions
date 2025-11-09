import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CalculateScoreGQL, Question } from '../../../../graphql/generated';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizService;
  let calculateScoreGQL: jest.Mocked<CalculateScoreGQL>;
  let router: jest.Mocked<Router>;

  const mockQuestions: Question[] = [
    {
      __typename: 'Question',
      id: 'q1',
      number: '1',
      phrase: 'Question 1',
      ruleId: 'r1',
      answers: {
        __typename: 'AnswersConnection',
        nodes: [
          { __typename: 'Answer', id: 'a1', number: '1', phrase: 'Answer 1', isCorrect: true, questionId: 'q1' },
          { __typename: 'Answer', id: 'a2', number: '2', phrase: 'Answer 2', isCorrect: false, questionId: 'q1' },
        ],
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 2,
      },
    },
    {
      __typename: 'Question',
      id: 'q2',
      number: '2',
      phrase: 'Question 2',
      ruleId: 'r1',
      answers: {
        __typename: 'AnswersConnection',
        nodes: [
          { __typename: 'Answer', id: 'a3', number: '1', phrase: 'Answer 3', isCorrect: false, questionId: 'q2' },
          { __typename: 'Answer', id: 'a4', number: '2', phrase: 'Answer 4', isCorrect: true, questionId: 'q2' },
        ],
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 2,
      },
    },
  ];

  beforeEach(() => {
    const calculateScoreGQLMock = {
      watch: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    // Mock performance API for testing
    global.performance = global.performance || ({} as Performance);
    global.performance.mark = jest.fn();
    global.performance.measure = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        QuizService,
        { provide: CalculateScoreGQL, useValue: calculateScoreGQLMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(QuizService);
    calculateScoreGQL = TestBed.inject(CalculateScoreGQL) as jest.Mocked<CalculateScoreGQL>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Quiz Initialization', () => {
    it('should initialize quiz with shuffled questions and answers', () => {
      service.initializeQuiz(mockQuestions, false);

      const config = service.config();
      expect(config).not.toBeNull();
      expect(config?.totalQuestions).toBe(2);
      expect(config?.timedMode).toBe(false);
      expect(config?.questions.length).toBe(2);
      expect(config?.questions[0].shuffledAnswers.length).toBe(2);
    });

    it('should initialize quiz in timed mode', () => {
      service.initializeQuiz(mockQuestions, true, 30);

      const config = service.config();
      const state = service.state();

      expect(config?.timedMode).toBe(true);
      expect(config?.timePerQuestion).toBe(30);
      expect(config?.totalTime).toBe(60); // 2 questions * 30 seconds
      expect(state.timeRemaining).toBe(60);
      expect(state.isTimerActive).toBe(true);
      expect(state.startTime).toBeDefined();
    });

    it('should clear previous results when initializing new quiz', () => {
      // Set some results
      service.results.set({
        totalQuestions: 5,
        correctCount: 3,
        wrongCount: 2,
        percentage: 60,
        answers: [],
      });

      service.initializeQuiz(mockQuestions, false);

      expect(service.results()).toBeNull();
    });

    it('should filter out questions without answers', () => {
      const questionsWithEmpty: Question[] = [
        ...mockQuestions,
        {
          __typename: 'Question',
          id: 'q3',
          number: '3',
          phrase: 'Question 3',
          ruleId: 'r1',
          answers: null,
        },
      ];

      service.initializeQuiz(questionsWithEmpty, false);

      const config = service.config();
      expect(config?.totalQuestions).toBe(2); // Empty question filtered out
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      service.initializeQuiz(mockQuestions, false);
    });

    it('should navigate to next question', () => {
      expect(service.state().currentQuestionIndex).toBe(0);

      service.nextQuestion();

      expect(service.state().currentQuestionIndex).toBe(1);
    });

    it('should not navigate beyond last question', () => {
      service.state.update((s) => ({ ...s, currentQuestionIndex: 1 }));

      service.nextQuestion();

      expect(service.state().currentQuestionIndex).toBe(1); // Stays at last question
    });

    it('should navigate to previous question', () => {
      service.state.update((s) => ({ ...s, currentQuestionIndex: 1 }));

      service.previousQuestion();

      expect(service.state().currentQuestionIndex).toBe(0);
    });

    it('should not navigate before first question', () => {
      expect(service.state().currentQuestionIndex).toBe(0);

      service.previousQuestion();

      expect(service.state().currentQuestionIndex).toBe(0); // Stays at first question
    });

    it('should correctly report canGoNext', () => {
      expect(service.canGoNext()).toBe(true);

      service.state.update((s) => ({ ...s, currentQuestionIndex: 1 }));

      expect(service.canGoNext()).toBe(false);
    });

    it('should correctly report canGoPrevious', () => {
      expect(service.canGoPrevious()).toBe(false);

      service.state.update((s) => ({ ...s, currentQuestionIndex: 1 }));

      expect(service.canGoPrevious()).toBe(true);
    });
  });

  describe('Answer Management', () => {
    beforeEach(() => {
      service.initializeQuiz(mockQuestions, false);
    });

    it('should record answer for current question', () => {
      service.answerCurrentQuestion(['a1', 'a2']);

      const answers = service.state().answers;
      expect(answers.length).toBe(1);
      expect(answers[0].questionId).toBe(service.currentQuestion()?.id);
      expect(answers[0].selectedAnswerIds).toEqual(['a1', 'a2']);
    });

    it('should update existing answer when answering same question again', () => {
      service.answerCurrentQuestion(['a1']);
      service.answerCurrentQuestion(['a1', 'a2']);

      const answers = service.state().answers;
      expect(answers.length).toBe(1);
      expect(answers[0].selectedAnswerIds).toEqual(['a1', 'a2']);
    });

    it('should get current answer IDs', () => {
      service.answerCurrentQuestion(['a1', 'a2']);

      const currentAnswerIds = service.getCurrentAnswerIds();

      expect(currentAnswerIds).toEqual(['a1', 'a2']);
    });

    it('should return empty array when no answer selected', () => {
      const currentAnswerIds = service.getCurrentAnswerIds();

      expect(currentAnswerIds).toEqual([]);
    });
  });

  describe('Progress', () => {
    beforeEach(() => {
      service.initializeQuiz(mockQuestions, false);
    });

    it('should calculate progress correctly', () => {
      let progress = service.progress();

      expect(progress.current).toBe(1);
      expect(progress.total).toBe(2);
      expect(progress.percentage).toBe(50);

      service.nextQuestion();
      progress = service.progress();

      expect(progress.current).toBe(2);
      expect(progress.total).toBe(2);
      expect(progress.percentage).toBe(100);
    });

    it('should return correct current question', () => {
      const currentQuestion = service.currentQuestion();

      expect(currentQuestion).toBeDefined();
      expect(currentQuestion?.id).toBe(service.config()?.questions[0].id);
    });
  });

  describe('Quiz Completion', () => {
    beforeEach(() => {
      service.initializeQuiz(mockQuestions, false);
      service.answerCurrentQuestion(['a1']);
      service.nextQuestion();
      service.answerCurrentQuestion(['a4']);
    });

    it('should complete quiz and calculate score', (done) => {
      const mockScoreResponse = {
        loading: false,
        data: {
          calculateScore: {
            score: 2,
            total: 2,
            percentage: '100',
            wrongQuestionsIds: [],
            wrongAnswerIds: [],
          },
        },
      };

      calculateScoreGQL.watch.mockReturnValue({
        valueChanges: of(mockScoreResponse),
      } as any);

      service.completeQuiz().subscribe((result) => {
        expect(result.loading).toBe(false);
        expect(service.results()).not.toBeNull();
        expect(service.results()?.totalQuestions).toBe(2);
        expect(service.results()?.correctCount).toBe(2);
        expect(service.results()?.wrongCount).toBe(0);
        expect(service.results()?.percentage).toBe(100);
        expect(service.state().isComplete).toBe(true);
        expect(router.navigate).toHaveBeenCalledWith(['/quiz/results']);
        done();
      });
    });

    it('should handle score calculation with wrong answers', (done) => {
      const mockScoreResponse = {
        loading: false,
        data: {
          calculateScore: {
            score: 1,
            total: 2,
            percentage: '50',
            wrongQuestionsIds: ['q2'],
            wrongAnswerIds: ['a3'],
          },
        },
      };

      calculateScoreGQL.watch.mockReturnValue({
        valueChanges: of(mockScoreResponse),
      } as any);

      service.completeQuiz().subscribe((result) => {
        expect(result.loading).toBe(false);
        const results = service.results();
        expect(results?.correctCount).toBe(1);
        expect(results?.wrongCount).toBe(1);
        expect(results?.percentage).toBe(50);

        // Find answers by question number (since questions are shuffled)
        const q1Answer = results?.answers.find((a) => a.questionNumber === '1');
        const q2Answer = results?.answers.find((a) => a.questionNumber === '2');
        expect(q1Answer?.isCorrect).toBe(true);
        expect(q2Answer?.isCorrect).toBe(false);
        done();
      });
    });

    it('should stop timer when completing quiz', (done) => {
      service.initializeQuiz(mockQuestions, true);

      const mockScoreResponse = {
        loading: false,
        data: {
          calculateScore: {
            score: 2,
            total: 2,
            percentage: '100',
            wrongQuestionsIds: [],
            wrongAnswerIds: [],
          },
        },
      };

      calculateScoreGQL.watch.mockReturnValue({
        valueChanges: of(mockScoreResponse),
      } as any);

      service.completeQuiz().subscribe(() => {
        // Verify timer was stopped by checking state
        expect(service.state().isTimerActive).toBe(false);
        done();
      });
    });
  });

  describe('Timer Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Mock performance API for testing
      global.performance = global.performance || ({} as Performance);
      global.performance.mark = jest.fn();
      global.performance.measure = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start timer in timed mode', () => {
      service.initializeQuiz(mockQuestions, true, 30);

      expect(service.state().isTimerActive).toBe(true);
      expect(service.state().timeRemaining).toBe(60);

      jest.advanceTimersByTime(1000);

      expect(service.state().timeRemaining).toBe(59);
    });

    it('should format time correctly', () => {
      expect(service.formatTime(65)).toBe('1:05');
      expect(service.formatTime(30)).toBe('0:30');
      expect(service.formatTime(125)).toBe('2:05');
      expect(service.formatTime(5)).toBe('0:05');
    });

    it('should format completion time correctly', () => {
      expect(service.formatCompletionTime(65)).toBe('1m 5s');
      expect(service.formatCompletionTime(30)).toBe('30s');
      expect(service.formatCompletionTime(125)).toBe('2m 5s');
      expect(service.formatCompletionTime(5)).toBe('5s');
    });

    it('should stop timer on reset', () => {
      service.initializeQuiz(mockQuestions, true, 30);
      expect(service.state().isTimerActive).toBe(true);

      service.resetQuiz();

      expect(service.state().isTimerActive).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset quiz to initial state', () => {
      service.initializeQuiz(mockQuestions, true);
      service.answerCurrentQuestion(['a1']);
      service.results.set({
        totalQuestions: 2,
        correctCount: 1,
        wrongCount: 1,
        percentage: 50,
        answers: [],
      });

      service.resetQuiz();

      expect(service.config()).toBeNull();
      expect(service.results()).toBeNull();
      expect(service.state().currentQuestionIndex).toBe(0);
      expect(service.state().answers.length).toBe(0);
      expect(service.state().isComplete).toBe(false);
      expect(service.state().timeRemaining).toBe(0);
      expect(service.state().isTimerActive).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should return null for currentQuestion when quiz not initialized', () => {
      expect(service.currentQuestion()).toBeNull();
    });

    it('should handle loading state from GraphQL', (done) => {
      const queryRef = {
        valueChanges: of({
          data: undefined,
          loading: true,
          networkStatus: 1,
        }),
      } as any;

      calculateScoreGQL.watch.mockReturnValue(queryRef);

      service.initializeQuiz(mockQuestions, false);
      service.answerCurrentQuestion(['a1']);

      service.completeQuiz().subscribe((result) => {
        expect(result.loading).toBe(true);
        expect(result.result).toBeUndefined();
        done();
      });
    });

    it('should handle GraphQL response with no data', (done) => {
      const queryRef = {
        valueChanges: of({
          data: undefined,
          loading: false,
          networkStatus: 7,
        }),
      } as any;

      calculateScoreGQL.watch.mockReturnValue(queryRef);

      service.initializeQuiz(mockQuestions, false);
      service.answerCurrentQuestion(['a1']);
      service.nextQuestion();
      service.answerCurrentQuestion(['a3']);

      service.completeQuiz().subscribe((result) => {
        expect(result.loading).toBe(false);
        expect(result.result).toEqual({
          totalQuestions: 0,
          correctCount: 0,
          wrongCount: 0,
          percentage: 0,
          answers: [],
        });
        done();
      });
    });

    it('should handle missing config when completing quiz', (done) => {
      const queryRef = {
        valueChanges: of({
          data: {
            calculateScore: {
              totalQuestions: 2,
              correctCount: 1,
              wrongCount: 1,
              percentage: 50,
              answers: [],
            },
          },
          loading: false,
          networkStatus: 7,
        }),
      } as any;

      calculateScoreGQL.watch.mockReturnValue(queryRef);

      service.completeQuiz().subscribe(() => {
        expect(service.results()).toEqual({
          totalQuestions: 0,
          correctCount: 0,
          wrongCount: 0,
          percentage: 0,
          answers: [],
        });
        done();
      });
    });

    it('should auto-complete quiz when timer reaches 0', (done) => {
      const mockScoreResponse = {
        loading: false,
        data: {
          calculateScore: {
            score: 0,
            total: 2,
            percentage: '0',
            wrongQuestionsIds: ['q1', 'q2'],
            wrongAnswerIds: [],
          },
        },
      };

      calculateScoreGQL.watch.mockReturnValue({
        valueChanges: of(mockScoreResponse),
      } as any);

      // Initialize with very short time (2 seconds total)
      service.initializeQuiz(mockQuestions, true, 1);

      // With 2 questions and 1 second per question, total time is 2 seconds
      expect(service.state().timeRemaining).toBe(2);
      expect(service.state().isTimerActive).toBe(true);

      // Wait for the timer to naturally complete (2 seconds + buffer)
      setTimeout(() => {
        const state = service.state();
        expect(state.timeRemaining).toBe(0);
        expect(state.isTimerActive).toBe(false);

        // The quiz completion should have been triggered
        // Check that navigation to results was called
        expect(router.navigate).toHaveBeenCalledWith(['/quiz/results']);
        done();
      }, 2500);
    }, 10000);
  });
});