import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { QuizService } from '../services/quiz.service';
import { QuizResultsComponent } from './quiz-results.component';

describe('QuizResultsComponent', () => {
  let component: QuizResultsComponent;
  let fixture: ComponentFixture<QuizResultsComponent>;
  let router: Router;
  let quizService: jest.Mocked<QuizService>;

  const mockResults = {
    totalQuestions: 10,
    correctCount: 8,
    wrongCount: 2,
    percentage: 80,
    answers: [],
  };

  beforeEach(async () => {
    const quizServiceMock = {
      results: jest.fn().mockReturnValue(mockResults),
      resetQuiz: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuizResultsComponent],
      providers: [{ provide: QuizService, useValue: quizServiceMock }, provideTranslateService(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizResultsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    quizService = TestBed.inject(QuizService) as jest.Mocked<QuizService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should not navigate when results exist', () => {
      quizService.results.mockReturnValue(mockResults);

      fixture.detectChanges();

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to home when no results exist', () => {
      quizService.results.mockReturnValue(null);

      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('FontAwesome Icons', () => {
    beforeEach(() => {
      quizService.results.mockReturnValue(mockResults);
      fixture.detectChanges();
    });

    it('should have faCheckCircle icon defined', () => {
      expect(component.faCheckCircle).toBeDefined();
      expect(component.faCheckCircle.iconName).toBe('circle-check');
    });

    it('should have faTimesCircle icon defined', () => {
      expect(component.faTimesCircle).toBeDefined();
      expect(component.faTimesCircle.iconName).toBe('circle-xmark');
    });

    it('should have faRedo icon defined', () => {
      expect(component.faRedo).toBeDefined();
      expect(component.faRedo.iconName).toBe('arrow-rotate-right');
    });

    it('should have faHome icon defined', () => {
      expect(component.faHome).toBeDefined();
      expect(component.faHome.iconName).toBe('house');
    });
  });

  describe('scoreColor computed', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return green for score >= 80%', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 85,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-green-600');
    });

    it('should return green for exactly 80%', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 80,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-green-600');
    });

    it('should return yellow for score >= 60% and < 80%', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 70,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-yellow-600');
    });

    it('should return yellow for exactly 60%', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 60,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-yellow-600');
    });

    it('should return red for score < 60%', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 50,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-red-600');
    });

    it('should return red for very low score', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 10,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-red-600');
    });

    it('should return default color when no results', () => {
      quizService.results.mockReturnValue(null);

      const color = component.scoreColor();
      expect(color).toBe('text-slate-900');
    });

    it('should return green for perfect score', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 100,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-green-600');
    });

    it('should return red for zero score', () => {
      quizService.results.mockReturnValue({
        ...mockResults,
        percentage: 0,
      });

      const color = component.scoreColor();
      expect(color).toBe('text-red-600');
    });
  });

  describe('retakeQuiz', () => {
    beforeEach(() => {
      quizService.results.mockReturnValue(mockResults);
      fixture.detectChanges();
    });

    it('should call quizService.resetQuiz', () => {
      component.retakeQuiz();

      expect(quizService.resetQuiz).toHaveBeenCalledTimes(1);
    });

    it('should call resetQuiz multiple times when invoked multiple times', () => {
      component.retakeQuiz();
      component.retakeQuiz();
      component.retakeQuiz();

      expect(quizService.resetQuiz).toHaveBeenCalledTimes(3);
    });

    it('should not pass any arguments to resetQuiz', () => {
      component.retakeQuiz();

      expect(quizService.resetQuiz).toHaveBeenCalledWith();
    });
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      quizService.results.mockReturnValue(mockResults);
      fixture.detectChanges();
    });

    it('should have router injected', () => {
      expect(component['_router']).toBeDefined();
    });

    it('should have quizService injected', () => {
      expect(component.quizService).toBeDefined();
    });

    it('should be standalone component', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete flow with good results', () => {
      quizService.results.mockReturnValue({
        totalQuestions: 20,
        correctCount: 18,
        wrongCount: 2,
        percentage: 90,
        answers: [],
      });

      fixture.detectChanges();

      expect(component.scoreColor()).toBe('text-green-600');
      expect(router.navigate).not.toHaveBeenCalled();

      component.retakeQuiz();
      expect(quizService.resetQuiz).toHaveBeenCalled();
    });

    it('should handle complete flow with poor results', () => {
      quizService.results.mockReturnValue({
        totalQuestions: 20,
        correctCount: 5,
        wrongCount: 15,
        percentage: 25,
        answers: [],
      });

      fixture.detectChanges();

      expect(component.scoreColor()).toBe('text-red-600');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect when initialized without results', () => {
      quizService.results.mockReturnValue(null);

      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.scoreColor()).toBe('text-slate-900');
    });
  });
});
