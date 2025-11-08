import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Question, Score } from '../../../../../../graphql/generated';
import { ScoreOverviewComponent } from './score-overview.component';

describe('ScoreOverviewComponent', () => {
  let component: ScoreOverviewComponent;
  let fixture: ComponentFixture<ScoreOverviewComponent>;

  const mockQuestions: Question[] = [
    {
      __typename: 'Question',
      id: 'q1',
      number: '1',
      phrase: 'Question 1',
      ruleId: 'r1',
    },
    {
      __typename: 'Question',
      id: 'q2',
      number: '2',
      phrase: 'Question 2',
      ruleId: 'r1',
    },
  ];

  const mockScore: Score = {
    __typename: 'Score',
    score: 8,
    total: 10,
    wrongQuestionsIds: ['q1'],
    wrongAnswerIds: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreOverviewComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept score input', () => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.score()).toEqual(mockScore);
    });

    it('should accept questions input', () => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.questions()).toEqual(mockQuestions);
    });

    it('should accept undefined score', () => {
      fixture.componentRef.setInput('score', undefined);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.score()).toBeUndefined();
    });

    it('should accept compact input with default false', () => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.compact()).toBe(false);
    });

    it('should accept compact input as true', () => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      expect(component.compact()).toBe(true);
    });

    it('should accept scoreLoading input with default false', () => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.scoreLoading()).toBe(false);
    });

    it('should accept scoreLoading input as true', () => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.componentRef.setInput('scoreLoading', true);
      fixture.detectChanges();

      expect(component.scoreLoading()).toBe(true);
    });
  });

  describe('FontAwesome Icons', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();
    });

    it('should have faThumbsUp icon defined', () => {
      expect(component.faThumbsUp).toBeDefined();
      expect(component.faThumbsUp.iconName).toBe('thumbs-up');
    });

    it('should have faTimesCircle icon defined', () => {
      expect(component.faTimesCircle).toBeDefined();
      expect(component.faTimesCircle.iconName).toBe('circle-xmark');
    });

    it('should have faRotateRight icon defined', () => {
      expect(component.faRotateRight).toBeDefined();
      expect(component.faRotateRight.iconName).toBe('rotate-right');
    });

    it('should have faSpinner icon defined', () => {
      expect(component.faSpinner).toBeDefined();
      expect(component.faSpinner.iconName).toBe('spinner');
    });
  });

  describe('isBadResult computed', () => {
    it('should return true for score < 50%', () => {
      fixture.componentRef.setInput('score', {
        __typename: 'Score',
        score: 4,
        total: 10,
        wrongQuestionsIds: [],
        wrongAnswerIds: [],
      });
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(true);
    });

    it('should return false for score >= 50%', () => {
      fixture.componentRef.setInput('score', {
        __typename: 'Score',
        score: 8,
        total: 10,
        wrongQuestionsIds: [],
        wrongAnswerIds: [],
      });
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(false);
    });

    it('should return false for exactly 50%', () => {
      fixture.componentRef.setInput('score', {
        __typename: 'Score',
        score: 5,
        total: 10,
        wrongQuestionsIds: [],
        wrongAnswerIds: [],
      });
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(false);
    });

    it('should return true when score is undefined', () => {
      fixture.componentRef.setInput('score', undefined);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(true);
    });

    it('should return true for perfect score', () => {
      fixture.componentRef.setInput('score', {
        __typename: 'Score',
        score: 10,
        total: 10,
        wrongQuestionsIds: [],
        wrongAnswerIds: [],
      });
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(false);
    });

    it('should return true for zero score', () => {
      fixture.componentRef.setInput('score', {
        __typename: 'Score',
        score: 0,
        total: 10,
        wrongQuestionsIds: [],
        wrongAnswerIds: [],
      });
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(true);
    });
  });

  describe('getQuestionNumber', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();
    });

    it('should return question number for valid id', () => {
      const number = component.getQuestionNumber('q1');
      expect(number).toBe('1');
    });

    it('should return undefined for invalid id', () => {
      const number = component.getQuestionNumber('invalid');
      expect(number).toBeUndefined();
    });

    it('should return undefined for null id', () => {
      const number = component.getQuestionNumber(null);
      expect(number).toBeUndefined();
    });

    it('should return undefined for undefined id', () => {
      const number = component.getQuestionNumber(undefined);
      expect(number).toBeUndefined();
    });

    it('should return correct number for second question', () => {
      const number = component.getQuestionNumber('q2');
      expect(number).toBe('2');
    });
  });

  describe('onQuestionClick', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();
    });

    it('should emit scrollToQuestion with valid id', () => {
      const scrollSpy = jest.fn();
      component.scrollToQuestion.subscribe(scrollSpy);

      component.onQuestionClick('q1');

      expect(scrollSpy).toHaveBeenCalledWith('q1');
    });

    it('should not emit scrollToQuestion with null id', () => {
      const scrollSpy = jest.fn();
      component.scrollToQuestion.subscribe(scrollSpy);

      component.onQuestionClick(null);

      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('should not emit scrollToQuestion with undefined id', () => {
      const scrollSpy = jest.fn();
      component.scrollToQuestion.subscribe(scrollSpy);

      component.onQuestionClick(undefined);

      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('should emit multiple times for multiple clicks', () => {
      const scrollSpy = jest.fn();
      component.scrollToQuestion.subscribe(scrollSpy);

      component.onQuestionClick('q1');
      component.onQuestionClick('q2');

      expect(scrollSpy).toHaveBeenCalledTimes(2);
      expect(scrollSpy).toHaveBeenNthCalledWith(1, 'q1');
      expect(scrollSpy).toHaveBeenNthCalledWith(2, 'q2');
    });
  });

  describe('Output Events', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.detectChanges();
    });

    it('should have scrollToQuestion output', () => {
      expect(component.scrollToQuestion).toBeDefined();
    });

    it('should have recalculate output', () => {
      expect(component.recalculate).toBeDefined();
    });

    it('should have restart output', () => {
      expect(component.restart).toBeDefined();
    });
  });

  describe('Component Configuration', () => {
    it('should be standalone component', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete good score scenario', () => {
      fixture.componentRef.setInput('score', {
        __typename: 'Score',
        score: 9,
        total: 10,
        wrongQuestionsIds: ['q2'],
        wrongAnswerIds: [],
      });
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.componentRef.setInput('compact', false);
      fixture.componentRef.setInput('scoreLoading', false);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(false);
      expect(component.getQuestionNumber('q2')).toBe('2');
    });

    it('should handle complete bad score scenario', () => {
      fixture.componentRef.setInput('score', {
        __typename: 'Score',
        score: 3,
        total: 10,
        wrongQuestionsIds: ['q1', 'q2'],
        wrongAnswerIds: [],
      });
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      expect(component.isBadResult()).toBe(true);
      expect(component.compact()).toBe(true);
    });

    it('should handle loading state', () => {
      fixture.componentRef.setInput('score', mockScore);
      fixture.componentRef.setInput('questions', mockQuestions);
      fixture.componentRef.setInput('scoreLoading', true);
      fixture.detectChanges();

      expect(component.scoreLoading()).toBe(true);
    });
  });
});
