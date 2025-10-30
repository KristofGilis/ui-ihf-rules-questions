import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizStateService, QuizConfig } from './quiz-state.service';
import { Question } from '../../../graphql/generated';

describe('QuizStateService', () => {
  let service: QuizStateService;

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      number: '1',
      phrase: 'Question 1?',
      ruleId: 'r1',
      answers: {
        edges: [
          {
            node: {
              id: 'a1',
              number: 'A',
              phrase: 'Answer A',
              isCorrect: true,
              questionId: 'q1',
            },
          },
          {
            node: {
              id: 'a2',
              number: 'B',
              phrase: 'Answer B',
              isCorrect: false,
              questionId: 'q1',
            },
          },
        ],
      },
    } as Question,
    {
      id: 'q2',
      number: '2',
      phrase: 'Question 2?',
      ruleId: 'r1',
      answers: {
        edges: [
          {
            node: {
              id: 'a3',
              number: 'A',
              phrase: 'Answer A',
              isCorrect: true,
              questionId: 'q2',
            },
          },
          {
            node: {
              id: 'a4',
              number: 'B',
              phrase: 'Answer B',
              isCorrect: true,
              questionId: 'q2',
            },
          },
        ],
      },
    } as Question,
  ];

  const defaultConfig: QuizConfig = {
    timedMode: false,
    timePerQuestion: 90,
    randomizeQuestions: false,
    randomizeAnswers: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizStateService);
  });

  afterEach(() => {
    service.resetQuiz();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startQuiz', () => {
    it('should initialize quiz session', () => {
      service.startQuiz(mockQuestions, defaultConfig);

      const session = service.session();
      expect(session).toBeTruthy();
      expect(session?.questions.length).toBe(2);
      expect(session?.currentQuestionIndex).toBe(0);
      expect(session?.isComplete).toBe(false);
    });

    it('should set current question', () => {
      service.startQuiz(mockQuestions, defaultConfig);

      const currentQuestion = service.currentQuestion();
      expect(currentQuestion).toBeTruthy();
      expect(currentQuestion?.id).toBe('q1');
    });

    it('should randomize questions when enabled', () => {
      const config: QuizConfig = { ...defaultConfig, randomizeQuestions: true };
      
      // Run multiple times to test randomization
      const orders = new Set<string>();
      for (let i = 0; i < 10; i++) {
        service.resetQuiz();
        service.startQuiz(mockQuestions, config);
        const session = service.session();
        orders.add(session?.questions.map((q) => q.id).join(',') || '');
      }

      // With randomization, we should see different orders (not guaranteed but very likely)
      expect(orders.size).toBeGreaterThan(1);
    });
  });

  describe('selectAnswer', () => {
    beforeEach(() => {
      service.startQuiz(mockQuestions, defaultConfig);
    });

    it('should select an answer', () => {
      service.selectAnswer('q1', 'a1');

      const session = service.session();
      const selectedAnswers = session?.selectedAnswers.get('q1');
      expect(selectedAnswers).toContain('a1');
    });

    it('should support multiple answer selection', () => {
      service.selectAnswer('q1', 'a1');
      service.selectAnswer('q1', 'a2');

      const session = service.session();
      const selectedAnswers = session?.selectedAnswers.get('q1');
      expect(selectedAnswers?.length).toBe(2);
      expect(selectedAnswers).toContain('a1');
      expect(selectedAnswers).toContain('a2');
    });

    it('should toggle answer selection', () => {
      service.selectAnswer('q1', 'a1');
      service.selectAnswer('q1', 'a1'); // Toggle off

      const session = service.session();
      const selectedAnswers = session?.selectedAnswers.get('q1');
      expect(selectedAnswers).not.toContain('a1');
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      service.startQuiz(mockQuestions, defaultConfig);
    });

    it('should move to next question', () => {
      service.nextQuestion();

      const session = service.session();
      expect(session?.currentQuestionIndex).toBe(1);
      expect(service.currentQuestion()?.id).toBe('q2');
    });

    it('should complete quiz when reaching last question', () => {
      service.nextQuestion();
      service.nextQuestion(); // Move past last question

      const session = service.session();
      expect(session?.isComplete).toBe(true);
    });

    it('should move to previous question', () => {
      service.nextQuestion();
      service.previousQuestion();

      const session = service.session();
      expect(session?.currentQuestionIndex).toBe(0);
      expect(service.currentQuestion()?.id).toBe('q1');
    });

    it('should not go below first question', () => {
      service.previousQuestion();

      const session = service.session();
      expect(session?.currentQuestionIndex).toBe(0);
    });
  });

  describe('progress', () => {
    beforeEach(() => {
      service.startQuiz(mockQuestions, defaultConfig);
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
  });

  describe('calculateResults', () => {
    beforeEach(() => {
      service.startQuiz(mockQuestions, defaultConfig);
    });

    it('should return null if quiz not complete', () => {
      const results = service.calculateResults();
      expect(results).toBeNull();
    });

    it('should calculate correct results for all correct answers', () => {
      service.selectAnswer('q1', 'a1'); // Correct
      service.nextQuestion();
      service.selectAnswer('q2', 'a3'); // Partially correct (needs a4 too)
      service.selectAnswer('q2', 'a4');
      service.nextQuestion(); // Complete

      const results = service.calculateResults();
      expect(results).toBeTruthy();
      expect(results?.totalQuestions).toBe(2);
      expect(results?.correctAnswers).toBe(2);
      expect(results?.percentage).toBe(100);
    });

    it('should calculate correct results for mixed answers', () => {
      service.selectAnswer('q1', 'a1'); // Correct
      service.nextQuestion();
      service.selectAnswer('q2', 'a3'); // Partially correct (missing a4)
      service.nextQuestion(); // Complete

      const results = service.calculateResults();
      expect(results).toBeTruthy();
      expect(results?.correctAnswers).toBe(1);
      expect(results?.wrongAnswers).toBe(1);
      expect(results?.percentage).toBe(50);
    });

    it('should include question results', () => {
      service.selectAnswer('q1', 'a1');
      service.nextQuestion();
      service.nextQuestion(); // Complete

      const results = service.calculateResults();
      expect(results?.questionResults.length).toBe(2);
      expect(results?.questionResults[0].question.id).toBe('q1');
      expect(results?.questionResults[0].isCorrect).toBe(true);
    });
  });

  describe('timed mode', () => {
    it('should enable timer in timed mode', fakeAsync(() => {
      const config: QuizConfig = { ...defaultConfig, timedMode: true, timePerQuestion: 5 };
      service.startQuiz(mockQuestions, config);

      expect(service.isTimedMode()).toBe(true);
      expect(service.timeRemaining()).toBe(5);

      tick(1000);
      expect(service.timeRemaining()).toBe(4);

      tick(1000);
      expect(service.timeRemaining()).toBe(3);
    }));

    it('should auto-advance when time runs out', fakeAsync(() => {
      const config: QuizConfig = { ...defaultConfig, timedMode: true, timePerQuestion: 2 };
      service.startQuiz(mockQuestions, config);

      expect(service.currentQuestion()?.id).toBe('q1');

      tick(2000); // Let timer run out

      expect(service.currentQuestion()?.id).toBe('q2');
    }));

    it('should reset timer on next question', fakeAsync(() => {
      const config: QuizConfig = { ...defaultConfig, timedMode: true, timePerQuestion: 10 };
      service.startQuiz(mockQuestions, config);

      tick(3000);
      expect(service.timeRemaining()).toBe(7);

      service.nextQuestion();
      expect(service.timeRemaining()).toBe(10); // Reset
    }));
  });

  describe('resetQuiz', () => {
    it('should clear quiz session', () => {
      service.startQuiz(mockQuestions, defaultConfig);
      service.resetQuiz();

      expect(service.session()).toBeNull();
      expect(service.currentQuestion()).toBeNull();
    });

    it('should stop timer', fakeAsync(() => {
      const config: QuizConfig = { ...defaultConfig, timedMode: true };
      service.startQuiz(mockQuestions, config);

      service.resetQuiz();
      tick(1000);

      // Timer should not update after reset
      expect(service.timeRemaining()).toBe(0);
    }));
  });
});
