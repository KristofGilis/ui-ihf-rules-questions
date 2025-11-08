import { TestBed } from '@angular/core/testing';
import { GuardResult, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { QuizComponent } from '../quiz.component';
import { QuizService } from '../services/quiz.service';
import { canDeactivateQuiz } from './can-deactivate-quiz.guard';

describe('canDeactivateQuiz', () => {
  let quizService: jest.Mocked<QuizService>;
  let component: jest.Mocked<QuizComponent>;

  beforeEach(() => {
    quizService = {
      resetQuiz: jest.fn(),
    } as any;

    component = {
      canDeactivate: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [{ provide: QuizService, useValue: quizService }],
    });
  });

  it('should allow navigation to quiz results', () => {
    const nextState = {
      url: '/quiz/results',
    } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, nextState)
    );

    expect(result).toBe(true);
    expect(quizService.resetQuiz).not.toHaveBeenCalled();
  });

  it('should allow navigation to quiz results with query params', () => {
    const nextState = {
      url: '/quiz/results?score=10',
    } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, nextState)
    );

    expect(result).toBe(true);
    expect(quizService.resetQuiz).not.toHaveBeenCalled();
  });

  it('should reset quiz and allow navigation when component returns true', () => {
    component.canDeactivate.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, null as any)
    );

    expect(result).toBe(true);
    expect(quizService.resetQuiz).toHaveBeenCalled();
  });

  it('should not reset quiz when component returns false', () => {
    component.canDeactivate.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, null as any)
    );

    expect(result).toBe(false);
    expect(quizService.resetQuiz).not.toHaveBeenCalled();
  });

  it('should reset quiz and allow navigation when user confirms via Observable', (done) => {
    component.canDeactivate.mockReturnValue(of(true));

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, null as any)
    );

    if (typeof result === 'boolean') {
      throw new Error('Expected Observable');
    }

    if (typeof result === 'object' && 'subscribe' in result) {
      result.subscribe((canNavigate: GuardResult) => {
        expect(canNavigate).toBe(true);
        expect(quizService.resetQuiz).toHaveBeenCalled();
        done();
      });
    } else {
      throw new Error('Expected Observable');
    }
  });

  it('should not reset quiz when user cancels via Observable', (done) => {
    component.canDeactivate.mockReturnValue(of(false));

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, null as any)
    );

    if (typeof result === 'boolean') {
      throw new Error('Expected Observable');
    }

    if (typeof result === 'object' && 'subscribe' in result) {
      result.subscribe((canNavigate: GuardResult) => {
        expect(canNavigate).toBe(false);
        expect(quizService.resetQuiz).not.toHaveBeenCalled();
        done();
      });
    } else {
      throw new Error('Expected Observable');
    }
  });

  it('should handle navigation to other routes', () => {
    const nextState = {
      url: '/home',
    } as RouterStateSnapshot;

    component.canDeactivate.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, nextState)
    );

    expect(result).toBe(true);
    expect(quizService.resetQuiz).toHaveBeenCalled();
  });

  it('should handle undefined nextState', () => {
    component.canDeactivate.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      canDeactivateQuiz(component, null as any, null as any, undefined as any)
    );

    expect(result).toBe(true);
    expect(quizService.resetQuiz).toHaveBeenCalled();
  });

  it('should call component canDeactivate method', () => {
    component.canDeactivate.mockReturnValue(true);

    TestBed.runInInjectionContext(() => canDeactivateQuiz(component, null as any, null as any, null as any));

    expect(component.canDeactivate).toHaveBeenCalled();
  });
});
