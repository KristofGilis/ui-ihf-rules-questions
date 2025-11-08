import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Question, Rule, Score } from '../../../graphql/generated';
import { QuestionsService } from '../questions/services/questions.service';
import { RuleComponent } from './rule.component';
import { RuleService } from './services/rule.service';

describe('RuleComponent', () => {
  let component: RuleComponent;
  let fixture: ComponentFixture<RuleComponent>;
  let ruleService: jest.Mocked<RuleService>;
  let questionsService: jest.Mocked<QuestionsService>;
  let translateService: TranslateService;
  let langChangeSubject: Subject<any>;

  const mockRule: Rule = {
    id: 'r1',
    number: '8.1',
    name: 'Test Rule',
    questions: {
      edges: [
        {
          node: {
            id: 'q1',
            number: '1',
            phrase: 'Question 1',
            ruleId: 'r1',
          } as Question,
          cursor: 'cursor1',
        },
        {
          node: {
            id: 'q2',
            number: '2',
            phrase: 'Question 2',
            ruleId: 'r1',
          } as Question,
          cursor: 'cursor2',
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: 2,
    },
  };

  const mockScore: Score = {
    total: 10,
    score: 8,
    percentage: '80',
    wrongQuestionsIds: ['q1'],
    wrongAnswerIds: ['a1'],
  };

  beforeEach(async () => {
    langChangeSubject = new Subject();

    const ruleServiceMock = {
      get: jest.fn().mockReturnValue(
        of({
          data: { ruleById: mockRule },
          loading: false,
          networkStatus: 7,
          dataState: 'complete' as const,
          partial: false,
        })
      ),
      refetch: jest.fn(),
      fetchMoreQuestions: jest.fn(),
      hasNextPage: false,
    };

    const questionsServiceMock = {
      calculateScore: jest.fn().mockReturnValue(
        of({
          data: { calculateScore: mockScore },
          loading: false,
          networkStatus: 7,
          dataState: 'complete' as const,
          partial: false,
        })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [RuleComponent],
      providers: [
        provideTranslateService(),
        { provide: RuleService, useValue: ruleServiceMock },
        { provide: QuestionsService, useValue: questionsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { id: 'r1' },
            },
          },
        },
      ],
    }).compileComponents();

    ruleService = TestBed.inject(RuleService) as jest.Mocked<RuleService>;
    questionsService = TestBed.inject(QuestionsService) as jest.Mocked<QuestionsService>;
    translateService = TestBed.inject(TranslateService);

    Object.defineProperty(translateService, 'onLangChange', {
      value: langChangeSubject.asObservable(),
      writable: true,
    });

    fixture = TestBed.createComponent(RuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should fetch rule on init', () => {
      expect(ruleService.get).toHaveBeenCalledWith('r1');
    });

    it('should set loading to false initially', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('rule$', () => {
    it('should emit rule data', (done) => {
      component.rule$.subscribe((rule) => {
        expect(rule).toEqual(mockRule);
        done();
      });
    });

    it('should share replay', () => {
      const subscription1 = component.rule$.subscribe();
      const subscription2 = component.rule$.subscribe();

      // Should only call get once due to shareReplay
      expect(ruleService.get).toHaveBeenCalledTimes(1);

      subscription1.unsubscribe();
      subscription2.unsubscribe();
    });
  });

  describe('getQuestions', () => {
    it('should extract questions from rule', () => {
      const questions = component.getQuestions(mockRule);

      expect(questions).toHaveLength(2);
      expect(questions[0].id).toBe('q1');
      expect(questions[1].id).toBe('q2');
    });

    it('should return empty array when rule is null', () => {
      const questions = component.getQuestions(null);

      expect(questions).toEqual([]);
    });

    it('should return empty array when questions is undefined', () => {
      const ruleWithoutQuestions: Rule = {
        id: 'r1',
        number: '8.1',
        name: 'Test Rule',
      };

      const questions = component.getQuestions(ruleWithoutQuestions);

      expect(questions).toEqual([]);
    });

    it('should return empty array when edges is undefined', () => {
      const ruleWithoutEdges: Rule = {
        id: 'r1',
        number: '8.1',
        name: 'Test Rule',
        questions: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCount: 0,
        },
      };

      const questions = component.getQuestions(ruleWithoutEdges);

      expect(questions).toEqual([]);
    });
  });

  describe('getRuleName', () => {
    it('should format rule name with number', () => {
      const name = component.getRuleName(mockRule);

      expect(name).toBe('8.1 - Test Rule');
    });

    it('should return undefined when rule is null', () => {
      const name = component.getRuleName(null);

      expect(name).toBeUndefined();
    });
  });

  describe('onCalculateScore', () => {
    it('should trigger score calculation', () => {
      const subscription = component.score$.subscribe();

      component.onCalculateScore(['q1', 'q2'], ['a1', 'a2']);

      expect(questionsService.calculateScore).toHaveBeenCalledWith(['q1', 'q2'], ['a1', 'a2']);

      subscription.unsubscribe();
    });

    it('should handle calculation with empty arrays', () => {
      const subscription = component.score$.subscribe();

      component.onCalculateScore([], []);

      expect(questionsService.calculateScore).toHaveBeenCalledWith([], []);

      subscription.unsubscribe();
    });
  });
  describe('onRestart', () => {
    it('should emit undefined through score$', () => {
      const values: (Score | undefined)[] = [];
      const subscription = component.score$.subscribe((score) => {
        values.push(score);
      });

      component.onRestart();

      expect(values).toContain(undefined);
      subscription.unsubscribe();
    });

    it('should set scoreLoading to false', () => {
      component.scoreLoading.set(true);

      component.onRestart();

      expect(component.scoreLoading()).toBe(false);
    });
  });

  describe('onScrollToQuestion', () => {
    it('should scroll to question element', () => {
      const scrollIntoViewMock = jest.fn();
      const mockElement = {
        scrollIntoView: scrollIntoViewMock,
      };

      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);

      component.onScrollToQuestion('q1');

      expect(document.querySelector).toHaveBeenCalledWith('[data-question-id="q1"]');
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });

      (document.querySelector as jest.Mock).mockRestore();
    });

    it('should handle non-existent question gracefully', () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      // Should not throw error
      expect(() => component.onScrollToQuestion('non-existent')).not.toThrow();

      (document.querySelector as jest.Mock).mockRestore();
    });
  });

  describe('onScroll', () => {
    beforeEach(() => {
      Object.defineProperty(ruleService, 'hasNextPage', {
        value: true,
        writable: true,
      });
    });

    it('should not fetch when loading', () => {
      component.loading.set(true);
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 1000, writable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });

      component.onScroll();

      expect(ruleService.fetchMoreQuestions).not.toHaveBeenCalled();
    });

    it('should fetch more questions when near bottom', () => {
      component.loading.set(false);
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 1100, writable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });

      component.onScroll();

      expect(ruleService.fetchMoreQuestions).toHaveBeenCalled();
    });

    it('should not fetch when not near bottom', () => {
      component.loading.set(false);
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });

      component.onScroll();

      expect(ruleService.fetchMoreQuestions).not.toHaveBeenCalled();
    });

    it('should not fetch when no more questions', () => {
      component.loading.set(false);
      Object.defineProperty(ruleService, 'hasNextPage', {
        value: false,
        writable: true,
      });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 1100, writable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });

      component.onScroll();

      expect(ruleService.fetchMoreQuestions).not.toHaveBeenCalled();
    });

    it('should use 200px threshold', () => {
      component.loading.set(false);
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      // scrollY + innerHeight = 1799, scrollHeight = 2000, difference = 201 (> 200)
      Object.defineProperty(window, 'scrollY', { value: 999, writable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });

      component.onScroll();

      expect(ruleService.fetchMoreQuestions).not.toHaveBeenCalled();
    });
  });

  describe('hasMoreQuestions', () => {
    it('should return true when service has next page', () => {
      Object.defineProperty(ruleService, 'hasNextPage', {
        value: true,
        writable: true,
      });

      expect(component.hasMoreQuestions).toBe(true);
    });

    it('should return false when service has no next page', () => {
      Object.defineProperty(ruleService, 'hasNextPage', {
        value: false,
        writable: true,
      });

      expect(component.hasMoreQuestions).toBe(false);
    });
  });

  describe('language change', () => {
    it('should refetch rule when language changes', () => {
      langChangeSubject.next({ lang: 'nl' });

      expect(ruleService.refetch).toHaveBeenCalled();
    });

    it('should refetch on multiple language changes', () => {
      langChangeSubject.next({ lang: 'nl' });
      langChangeSubject.next({ lang: 'en' });
      langChangeSubject.next({ lang: 'srb' });

      expect(ruleService.refetch).toHaveBeenCalledTimes(3);
    });
  });
});
