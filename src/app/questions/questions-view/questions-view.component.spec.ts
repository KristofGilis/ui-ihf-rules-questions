import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Question, Score } from '../../../../graphql/generated';
import { QuestionsViewComponent } from './questions-view.component';

describe('QuestionsViewComponent', () => {
  let component: QuestionsViewComponent;
  let fixture: ComponentFixture<QuestionsViewComponent>;

  const mockQuestions: Question[] = [
    {
      id: '1',
      number: '1',
      phrase: 'Question 1',
      ruleId: 'r1',
    },
    {
      id: '2',
      number: '2',
      phrase: 'Question 2',
      ruleId: 'r2',
    },
  ];

  const mockScore: Score = {
    total: 10,
    score: 8,
    percentage: '80',
    wrongQuestionsIds: ['1'],
    wrongAnswerIds: ['a1'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionsViewComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionsViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questions', mockQuestions);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('hasMoreQuestions', false);
    fixture.componentRef.setInput('score', undefined);
    fixture.componentRef.setInput('scoreLoading', false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSelectAnswer', () => {
    it('should add answer to selectedAnswers', () => {
      component.onSelectAnswer('a1');
      expect(component.selectedAnswers()).toEqual(['a1']);
    });

    it('should add multiple answers to selectedAnswers', () => {
      component.onSelectAnswer('a1');
      component.onSelectAnswer('a2');
      component.onSelectAnswer('a3');
      expect(component.selectedAnswers()).toEqual(['a1', 'a2', 'a3']);
    });
  });

  describe('onDeselectAnswer', () => {
    it('should remove answer from selectedAnswers', () => {
      component.selectedAnswers.set(['a1', 'a2', 'a3']);
      component.onDeselectAnswer('a2');
      expect(component.selectedAnswers()).toEqual(['a1', 'a3']);
    });

    it('should handle removing non-existent answer', () => {
      component.selectedAnswers.set(['a1', 'a2']);
      component.onDeselectAnswer('a3');
      expect(component.selectedAnswers()).toEqual(['a1', 'a2']);
    });
  });

  describe('onCalculateScore', () => {
    it('should emit calculareScore event when no more questions', () => {
      const emitSpy = jest.fn();
      component.calculareScore.subscribe(emitSpy);
      component.selectedAnswers.set(['a1', 'a2']);
      fixture.componentRef.setInput('hasMoreQuestions', false);

      component.onCalculateScore();

      expect(emitSpy).toHaveBeenCalledWith({
        questionIds: ['1', '2'],
        selectedAnswerIds: ['a1', 'a2'],
      });
    });

    it('should not emit calculareScore event when more questions available', () => {
      const emitSpy = jest.fn();
      component.calculareScore.subscribe(emitSpy);
      component.selectedAnswers.set(['a1', 'a2']);
      fixture.componentRef.setInput('hasMoreQuestions', true);

      component.onCalculateScore();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onRestart', () => {
    it('should clear selected answers', () => {
      component.selectedAnswers.set(['a1', 'a2', 'a3']);

      component.onRestart();

      expect(component.selectedAnswers()).toEqual([]);
    });

    it('should close mobile score dialog', () => {
      component.showMobileScoreDialog.set(true);

      component.onRestart();

      expect(component.showMobileScoreDialog()).toBe(false);
    });

    it('should emit restart event', () => {
      const emitSpy = jest.fn();
      component.restart.subscribe(emitSpy);

      component.onRestart();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should scroll to top', () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo');

      component.onRestart();

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('should uncheck all checkboxes', () => {
      // Create mock checkboxes
      const checkbox1 = document.createElement('input');
      checkbox1.type = 'checkbox';
      checkbox1.checked = true;
      const checkbox2 = document.createElement('input');
      checkbox2.type = 'checkbox';
      checkbox2.checked = true;

      document.body.appendChild(checkbox1);
      document.body.appendChild(checkbox2);

      component.onRestart();

      expect(checkbox1.checked).toBe(false);
      expect(checkbox2.checked).toBe(false);

      // Cleanup
      document.body.removeChild(checkbox1);
      document.body.removeChild(checkbox2);
    });
  });

  describe('isQuestionWrong', () => {
    it('should return true for wrong question', () => {
      fixture.componentRef.setInput('score', mockScore);
      expect(component.isQuestionWrong('1')).toBe(true);
    });

    it('should return false for correct question', () => {
      fixture.componentRef.setInput('score', mockScore);
      expect(component.isQuestionWrong('2')).toBe(false);
    });

    it('should return false when score is undefined', () => {
      fixture.componentRef.setInput('score', undefined);
      expect(component.isQuestionWrong('1')).toBe(false);
    });

    it('should return false when wrongQuestionsIds is empty', () => {
      const scoreWithoutWrong: Score = {
        total: 10,
        score: 10,
        percentage: '100',
        wrongQuestionsIds: [],
        wrongAnswerIds: [],
      };
      fixture.componentRef.setInput('score', scoreWithoutWrong);
      expect(component.isQuestionWrong('1')).toBe(false);
    });
  });

  describe('scrollToQuestion', () => {
    it('should close mobile dialog and scroll to question', (done) => {
      component.showMobileScoreDialog.set(true);

      const mockScrollIntoView = jest.fn();
      const mockQuestionComponent = {
        question: () => ({ id: '1' }),
        elementRef: {
          nativeElement: {
            scrollIntoView: mockScrollIntoView,
          },
        },
      };

      jest.spyOn(component, 'questionComponents').mockReturnValue([mockQuestionComponent] as any);

      component.scrollToQuestion('1');

      expect(component.showMobileScoreDialog()).toBe(false);

      setTimeout(() => {
        expect(mockScrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'center',
        });
        done();
      }, 150);
    });

    it('should handle non-existent question', () => {
      jest.spyOn(component, 'questionComponents').mockReturnValue([]);

      // Should not throw error
      expect(() => component.scrollToQuestion('999')).not.toThrow();
    });
  });

  describe('toggleMobileScoreDialog', () => {
    it('should toggle dialog from false to true', () => {
      component.showMobileScoreDialog.set(false);

      component.toggleMobileScoreDialog();

      expect(component.showMobileScoreDialog()).toBe(true);
    });

    it('should toggle dialog from true to false', () => {
      component.showMobileScoreDialog.set(true);

      component.toggleMobileScoreDialog();

      expect(component.showMobileScoreDialog()).toBe(false);
    });
  });

  describe('closeMobileScoreDialog', () => {
    it('should set dialog to false', () => {
      component.showMobileScoreDialog.set(true);

      component.closeMobileScoreDialog();

      expect(component.showMobileScoreDialog()).toBe(false);
    });

    it('should keep dialog false when already closed', () => {
      component.showMobileScoreDialog.set(false);

      component.closeMobileScoreDialog();

      expect(component.showMobileScoreDialog()).toBe(false);
    });
  });

  describe('mobile dialog scroll lock effect', () => {
    it('should lock body scroll when mobile dialog opens with score on mobile', (done) => {
      fixture.componentRef.setInput('score', mockScore);

      // Mock isMobile as true
      Object.defineProperty(component, 'isMobile', {
        value: () => true,
        writable: false,
      });

      window.scrollY = 100;

      component.showMobileScoreDialog.set(true);
      fixture.detectChanges();

      setTimeout(() => {
        expect(document.body.style.position).toBe('fixed');
        expect(document.body.style.top).toBe('-100px');
        expect(document.body.style.width).toBe('100%');
        done();
      }, 50);
    });

    it('should unlock body scroll when mobile dialog closes', (done) => {
      fixture.componentRef.setInput('score', mockScore);

      // Mock isMobile as true
      Object.defineProperty(component, 'isMobile', {
        value: () => true,
        writable: false,
      });

      // Mock scrollTo

      // First open
      component.showMobileScoreDialog.set(true);
      fixture.detectChanges();

      setTimeout(() => {
        // Then close
        component.showMobileScoreDialog.set(false);
        fixture.detectChanges();

        setTimeout(() => {
          expect(document.body.style.position).toBe('');
          expect(document.body.style.top).toBe('');
          expect(document.body.style.width).toBe('');
          done();
        }, 50);
      }, 50);
    });

    it('should not lock scroll when on desktop', (done) => {
      fixture.componentRef.setInput('score', mockScore);

      // Mock isMobile as false
      Object.defineProperty(component, 'isMobile', {
        value: () => false,
        writable: false,
      });

      component.showMobileScoreDialog.set(true);
      fixture.detectChanges();

      setTimeout(() => {
        expect(document.body.style.position).not.toBe('fixed');
        done();
      }, 50);
    });
  });

  describe('auto-open dialog effect', () => {
    it('should not auto-open dialog on initial load', (done) => {
      // Mock isMobile as true
      Object.defineProperty(component, 'isMobile', {
        value: () => true,
        writable: false,
      });

      fixture.componentRef.setInput('score', mockScore);
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.showMobileScoreDialog()).toBe(false);
        done();
      }, 150);
    });

    it('should not auto-open dialog on desktop', (done) => {
      // Create a fresh component instance with isInitialLoad = false
      const newFixture = TestBed.createComponent(QuestionsViewComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.componentRef.setInput('questions', mockQuestions);
      newFixture.componentRef.setInput('loading', false);
      newFixture.componentRef.setInput('hasMoreQuestions', false);
      newFixture.componentRef.setInput('score', undefined);
      newFixture.componentRef.setInput('scoreLoading', false);

      // Mock isMobile as false
      Object.defineProperty(newComponent, 'isMobile', {
        value: () => false,
        writable: false,
      });

      // Force initial load flag to false
      (newComponent as any).isInitialLoad = false;

      newFixture.componentRef.setInput('score', mockScore);
      newFixture.detectChanges();

      setTimeout(() => {
        expect(newComponent.showMobileScoreDialog()).toBe(false);
        done();
      }, 150);
    });
  });
});
