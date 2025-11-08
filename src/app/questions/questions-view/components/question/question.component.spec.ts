import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Question } from '../../../../../../graphql/generated';
import { QuestionComponent } from './question.component';

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;

  const mockQuestion: Question = {
    __typename: 'Question',
    id: 'q1',
    number: '1',
    phrase: 'What is the correct answer?',
    ruleId: 'r1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept question input', () => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();

      expect(component.question()).toEqual(mockQuestion);
    });

    it('should accept isWrong input with default false', () => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();

      expect(component.isWrong()).toBe(false);
    });

    it('should accept isWrong input as true', () => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.componentRef.setInput('isWrong', true);
      fixture.detectChanges();

      expect(component.isWrong()).toBe(true);
    });

    it('should accept isWrong input as false', () => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.componentRef.setInput('isWrong', false);
      fixture.detectChanges();

      expect(component.isWrong()).toBe(false);
    });
  });

  describe('FontAwesome Icons', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();
    });

    it('should have faTimesCircle icon defined', () => {
      expect(component.faTimesCircle).toBeDefined();
      expect(component.faTimesCircle.iconName).toBe('circle-xmark');
    });
  });

  describe('onCheckboxChange', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();
    });

    it('should emit selectAnswer when checked is true', () => {
      const selectSpy = jest.fn();
      component.selectAnswer.subscribe(selectSpy);

      component.onCheckboxChange('a1', true);

      expect(selectSpy).toHaveBeenCalledWith('a1');
    });

    it('should emit deselectAnswer when checked is false', () => {
      const deselectSpy = jest.fn();
      component.deselectAnswer.subscribe(deselectSpy);

      component.onCheckboxChange('a1', false);

      expect(deselectSpy).toHaveBeenCalledWith('a1');
    });

    it('should not emit deselectAnswer when checked is true', () => {
      const deselectSpy = jest.fn();
      component.deselectAnswer.subscribe(deselectSpy);

      component.onCheckboxChange('a1', true);

      expect(deselectSpy).not.toHaveBeenCalled();
    });

    it('should not emit selectAnswer when checked is false', () => {
      const selectSpy = jest.fn();
      component.selectAnswer.subscribe(selectSpy);

      component.onCheckboxChange('a1', false);

      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple checkbox changes', () => {
      const selectSpy = jest.fn();
      const deselectSpy = jest.fn();
      component.selectAnswer.subscribe(selectSpy);
      component.deselectAnswer.subscribe(deselectSpy);

      component.onCheckboxChange('a1', true);
      component.onCheckboxChange('a2', true);
      component.onCheckboxChange('a1', false);

      expect(selectSpy).toHaveBeenCalledTimes(2);
      expect(deselectSpy).toHaveBeenCalledTimes(1);
      expect(selectSpy).toHaveBeenNthCalledWith(1, 'a1');
      expect(selectSpy).toHaveBeenNthCalledWith(2, 'a2');
      expect(deselectSpy).toHaveBeenCalledWith('a1');
    });

    it('should emit correct answer ids', () => {
      const selectSpy = jest.fn();
      component.selectAnswer.subscribe(selectSpy);

      component.onCheckboxChange('answer-123', true);

      expect(selectSpy).toHaveBeenCalledWith('answer-123');
    });
  });

  describe('Output Events', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();
    });

    it('should have selectAnswer output', () => {
      expect(component.selectAnswer).toBeDefined();
    });

    it('should have deselectAnswer output', () => {
      expect(component.deselectAnswer).toBeDefined();
    });
  });

  describe('ElementRef', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();
    });

    it('should have elementRef injected', () => {
      expect(component.elementRef).toBeDefined();
    });

    it('should reference the component native element', () => {
      expect(component.elementRef.nativeElement).toBeDefined();
    });
  });

  describe('Component Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();
    });

    it('should be standalone component', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete question scenario with wrong answer', () => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.componentRef.setInput('isWrong', true);
      fixture.detectChanges();

      expect(component.question()).toEqual(mockQuestion);
      expect(component.isWrong()).toBe(true);
    });

    it('should handle selecting and deselecting answers', () => {
      fixture.componentRef.setInput('question', mockQuestion);
      fixture.detectChanges();

      const selectSpy = jest.fn();
      const deselectSpy = jest.fn();
      component.selectAnswer.subscribe(selectSpy);
      component.deselectAnswer.subscribe(deselectSpy);

      // Select answer
      component.onCheckboxChange('a1', true);
      expect(selectSpy).toHaveBeenCalledWith('a1');

      // Deselect answer
      component.onCheckboxChange('a1', false);
      expect(deselectSpy).toHaveBeenCalledWith('a1');
    });
  });
});
