import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { GetQuestionsGQL, Question } from '../../../graphql/generated';
import { ConfirmationDialogService } from '../shared/services/confirmation-dialog.service';
import { QuizComponent } from './quiz.component';
import { QuizService } from './services/quiz.service';

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;
  let quizService: jest.Mocked<QuizService>;
  let confirmationDialogService: jest.Mocked<ConfirmationDialogService>;
  let getQuestionsGQL: jest.Mocked<GetQuestionsGQL>;
  let translateService: TranslateService;

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      number: '1',
      phrase: 'Question 1',
      ruleId: 'r1',
    },
    {
      id: 'q2',
      number: '2',
      phrase: 'Question 2',
      ruleId: 'r2',
    },
    {
      id: 'q3',
      number: '3',
      phrase: 'Question 3',
      ruleId: 'r3',
    },
  ];

  beforeEach(async () => {
    const quizServiceMock = {
      config: jest.fn().mockReturnValue(undefined), // Initially undefined to allow initializeQuiz to be called
      state: jest.fn().mockReturnValue({
        currentQuestionIndex: 0,
        isComplete: false,
        timeRemaining: 900,
        isTimerActive: false,
        answers: [],
      }),
      progress: jest.fn().mockReturnValue({ current: 1, total: 10, percentage: 10 }),
      currentQuestion: jest.fn().mockReturnValue(mockQuestions[0]),
      initializeQuiz: jest.fn(),
      answerCurrentQuestion: jest.fn(),
      nextQuestion: jest.fn(),
      previousQuestion: jest.fn(),
      completeQuiz: jest.fn().mockReturnValue(of({ loading: false })),
      canGoNext: jest.fn().mockReturnValue(true),
      canGoPrevious: jest.fn().mockReturnValue(false),
      getCurrentAnswerIds: jest.fn().mockReturnValue([]),
      formatTime: jest.fn(
        (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
      ),
    };

    const confirmationDialogServiceMock = {
      confirm: jest.fn().mockReturnValue(of(true)),
    };

    const getQuestionsGQLMock = {
      watch: jest.fn().mockReturnValue({
        valueChanges: of({
          data: {
            questions: {
              edges: mockQuestions.map((q) => ({ node: q, cursor: `cursor-${q.id}` })),
            },
          },
          loading: false,
          networkStatus: 7,
        }),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [
        provideTranslateService(),
        { provide: QuizService, useValue: quizServiceMock },
        { provide: ConfirmationDialogService, useValue: confirmationDialogServiceMock },
        { provide: GetQuestionsGQL, useValue: getQuestionsGQLMock },
        {
          provide: Router,
          useValue: {
            currentNavigation: jest.fn().mockReturnValue({
              extras: {
                state: { count: 10, timed: false },
              },
            }),
          },
        },
      ],
    }).compileComponents();

    quizService = TestBed.inject(QuizService) as jest.Mocked<QuizService>;
    confirmationDialogService = TestBed.inject(ConfirmationDialogService) as jest.Mocked<ConfirmationDialogService>;
    getQuestionsGQL = TestBed.inject(GetQuestionsGQL) as jest.Mocked<GetQuestionsGQL>;
    translateService = TestBed.inject(TranslateService);

    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should fetch questions with correct parameters', () => {
      expect(getQuestionsGQL.watch).toHaveBeenCalledWith({
        variables: {
          first: 10,
          random: true,
        },
        fetchPolicy: 'no-cache',
      });
    });

    it('should initialize quiz with fetched questions', (done) => {
      component.questions$.subscribe(() => {
        expect(quizService.initializeQuiz).toHaveBeenCalledWith(mockQuestions, false);
        done();
      });
    });

    it('should not reinitialize if quiz config already exists', (done) => {
      quizService.config.mockReturnValue({
        questions: [],
        totalQuestions: 10,
        timedMode: true,
        timePerQuestion: 90,
        totalTime: 900,
      });
      quizService.initializeQuiz.mockClear();

      const newFixture = TestBed.createComponent(QuizComponent);
      const newComponent = newFixture.componentInstance;

      newComponent.questions$.subscribe(() => {
        expect(quizService.initializeQuiz).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle empty questions response', (done) => {
      getQuestionsGQL.watch.mockReturnValue({
        valueChanges: of({
          data: null,
          loading: false,
          networkStatus: 7,
        }),
      } as any);

      const newFixture = TestBed.createComponent(QuizComponent);
      const newComponent = newFixture.componentInstance;

      newComponent.questions$.subscribe((questions) => {
        expect(questions).toEqual([]);
        done();
      });
    });

    it('should use count from navigation state', () => {
      expect(getQuestionsGQL.watch).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            first: 10,
          }),
        })
      );
    });

    it('should use timed from navigation state', (done) => {
      component.questions$.subscribe(() => {
        expect(quizService.initializeQuiz).toHaveBeenCalledWith(expect.anything(), false);
        done();
      });
    });
  });

  describe('toggleAnswer', () => {
    it('should add answer to selectedAnswers', () => {
      component.toggleAnswer('a1');

      expect(component.selectedAnswers.has('a1')).toBe(true);
      expect(quizService.answerCurrentQuestion).toHaveBeenCalledWith(['a1']);
    });

    it('should remove answer if already selected', () => {
      component.selectedAnswers.add('a1');

      component.toggleAnswer('a1');

      expect(component.selectedAnswers.has('a1')).toBe(false);
      expect(quizService.answerCurrentQuestion).toHaveBeenCalledWith([]);
    });

    it('should handle multiple answers', () => {
      component.toggleAnswer('a1');
      component.toggleAnswer('a2');

      expect(component.selectedAnswers.has('a1')).toBe(true);
      expect(component.selectedAnswers.has('a2')).toBe(true);
      expect(quizService.answerCurrentQuestion).toHaveBeenLastCalledWith(['a1', 'a2']);
    });
  });

  describe('goToNext', () => {
    it('should call quizService.nextQuestion', () => {
      component.goToNext();

      expect(quizService.nextQuestion).toHaveBeenCalled();
    });

    it('should load current answers', () => {
      quizService.getCurrentAnswerIds.mockReturnValue(['a1', 'a2']);

      component.goToNext();

      expect(component.selectedAnswers.has('a1')).toBe(true);
      expect(component.selectedAnswers.has('a2')).toBe(true);
    });
  });

  describe('goToPrevious', () => {
    it('should call quizService.previousQuestion', () => {
      component.goToPrevious();

      expect(quizService.previousQuestion).toHaveBeenCalled();
    });

    it('should load current answers', () => {
      quizService.getCurrentAnswerIds.mockReturnValue(['a3']);

      component.goToPrevious();

      expect(component.selectedAnswers.has('a3')).toBe(true);
    });
  });

  describe('completeQuiz', () => {
    it('should call quizService.completeQuiz', () => {
      component.completeQuiz();

      expect(quizService.completeQuiz).toHaveBeenCalled();
    });

    it('should set completingQuiz$ observable', (done) => {
      component.completeQuiz();

      component.completingQuiz$?.subscribe((state) => {
        expect(state.loading).toBe(false);
        done();
      });
    });
  });

  describe('formatTime', () => {
    it('should format seconds to MM:SS', () => {
      expect(component.formatTime(90)).toBe('1:30');
    });

    it('should pad single digit seconds', () => {
      expect(component.formatTime(65)).toBe('1:05');
    });

    it('should handle zero', () => {
      expect(component.formatTime(0)).toBe('0:00');
    });

    it('should handle large values', () => {
      expect(component.formatTime(3661)).toBe('61:01');
    });
  });

  describe('keyboard shortcuts', () => {
    describe('arrow left', () => {
      it('should go to previous question when allowed', () => {
        quizService.canGoPrevious.mockReturnValue(true);
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        component.onArrowLeft(event);

        expect(quizService.previousQuestion).toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      it('should not go to previous when not allowed', () => {
        quizService.canGoPrevious.mockReturnValue(false);
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

        component.onArrowLeft(event);

        expect(quizService.previousQuestion).not.toHaveBeenCalled();
      });

      it('should ignore if target is input', () => {
        quizService.canGoPrevious.mockReturnValue(true);
        const input = document.createElement('input');
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        Object.defineProperty(event, 'target', { value: input, writable: false });

        component.onArrowLeft(event);

        expect(quizService.previousQuestion).not.toHaveBeenCalled();
      });

      it('should ignore if target is textarea', () => {
        quizService.canGoPrevious.mockReturnValue(true);
        const textarea = document.createElement('textarea');
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        Object.defineProperty(event, 'target', { value: textarea, writable: false });

        component.onArrowLeft(event);

        expect(quizService.previousQuestion).not.toHaveBeenCalled();
      });
    });

    describe('arrow right', () => {
      it('should go to next question when allowed', () => {
        quizService.canGoNext.mockReturnValue(true);
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        component.onArrowRight(event);

        expect(quizService.nextQuestion).toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      it('should not go to next when not allowed', () => {
        quizService.canGoNext.mockReturnValue(false);
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

        component.onArrowRight(event);

        expect(quizService.nextQuestion).not.toHaveBeenCalled();
      });

      it('should ignore if target is input', () => {
        quizService.canGoNext.mockReturnValue(true);
        const input = document.createElement('input');
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        Object.defineProperty(event, 'target', { value: input, writable: false });

        component.onArrowRight(event);

        expect(quizService.nextQuestion).not.toHaveBeenCalled();
      });
    });

    describe('enter', () => {
      it('should complete quiz when on last question', () => {
        quizService.canGoNext.mockReturnValue(false);
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        component.onEnter(event);

        expect(quizService.completeQuiz).toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      it('should not complete quiz when not on last question', () => {
        quizService.canGoNext.mockReturnValue(true);
        const event = new KeyboardEvent('keydown', { key: 'Enter' });

        component.onEnter(event);

        expect(quizService.completeQuiz).not.toHaveBeenCalled();
      });

      it('should ignore if target is button', () => {
        quizService.canGoNext.mockReturnValue(false);
        const button = document.createElement('button');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(event, 'target', { value: button, writable: false });

        component.onEnter(event);

        expect(quizService.completeQuiz).not.toHaveBeenCalled();
      });

      it('should ignore if target is link', () => {
        quizService.canGoNext.mockReturnValue(false);
        const link = document.createElement('a');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(event, 'target', { value: link, writable: false });

        component.onEnter(event);

        expect(quizService.completeQuiz).not.toHaveBeenCalled();
      });

      it('should ignore if target is input', () => {
        quizService.canGoNext.mockReturnValue(false);
        const input = document.createElement('input');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(event, 'target', { value: input, writable: false });

        component.onEnter(event);

        expect(quizService.completeQuiz).not.toHaveBeenCalled();
      });
    });
  });

  describe('canDeactivate', () => {
    it('should allow deactivation when quiz is complete', () => {
      quizService.state.mockReturnValue({
        currentQuestionIndex: 5,
        isComplete: true,
        timeRemaining: 0,
        isTimerActive: false,
        answers: [],
      });

      const result = component.canDeactivate();

      expect(result).toBe(true);
      expect(confirmationDialogService.confirm).not.toHaveBeenCalled();
    });

    it('should allow deactivation when quiz is not initialized', () => {
      quizService.config.mockReturnValue(null);

      const result = component.canDeactivate();

      expect(result).toBe(true);
      expect(confirmationDialogService.confirm).not.toHaveBeenCalled();
    });

    it('should allow deactivation on first question', () => {
      quizService.state.mockReturnValue({
        currentQuestionIndex: 0,
        isComplete: false,
        timeRemaining: 900,
        isTimerActive: false,
        answers: [],
      });

      const result = component.canDeactivate();

      expect(result).toBe(true);
      expect(confirmationDialogService.confirm).not.toHaveBeenCalled();
    });

    it('should show confirmation dialog when leaving mid-quiz', (done) => {
      quizService.state.mockReturnValue({
        currentQuestionIndex: 5,
        isComplete: false,
        timeRemaining: 500,
        isTimerActive: true,
        answers: [],
      });
      quizService.config.mockReturnValue({
        questions: [],
        totalQuestions: 10,
        timedMode: true,
        timePerQuestion: 90,
        totalTime: 900,
      });
      jest.spyOn(translateService, 'instant').mockReturnValue('Mocked Text');

      const result = component.canDeactivate();

      if (typeof result === 'boolean') {
        throw new Error('Expected Observable but got boolean');
      }

      result.subscribe((canLeave) => {
        expect(canLeave).toBe(true);
        expect(confirmationDialogService.confirm).toHaveBeenCalledWith({
          title: 'Mocked Text',
          message: 'Mocked Text',
          confirmText: 'Mocked Text',
          cancelText: 'Mocked Text',
        });
        done();
      });
    });

    it('should use correct translation keys for confirmation dialog', () => {
      quizService.state.mockReturnValue({
        currentQuestionIndex: 5,
        isComplete: false,
        timeRemaining: 500,
        isTimerActive: true,
        answers: [],
      });
      quizService.config.mockReturnValue({
        questions: [],
        totalQuestions: 10,
        timedMode: true,
        timePerQuestion: 90,
        totalTime: 900,
      });
      const instantSpy = jest.spyOn(translateService, 'instant');

      component.canDeactivate();

      expect(instantSpy).toHaveBeenCalledWith('quiz.leave_title');
      expect(instantSpy).toHaveBeenCalledWith('quiz.leave_warning');
      expect(instantSpy).toHaveBeenCalledWith('quiz.leave_confirm');
      expect(instantSpy).toHaveBeenCalledWith('quiz.leave_cancel');
    });
  });
});
