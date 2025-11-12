import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { QuizSetupComponent } from './quiz-setup.component';

describe('QuizSetupComponent', () => {
  let component: QuizSetupComponent;
  let fixture: ComponentFixture<QuizSetupComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuizSetupComponent],
      providers: [{ provide: Router, useValue: routerMock }, provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizSetupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onStartQuiz', () => {
    it('should navigate to quiz view with correct state', () => {
      const config = {
        questionCount: 15,
        timedMode: true,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 15,
          timed: true,
        },
      });
    });

    it('should navigate with default config values', () => {
      const config = {
        questionCount: 10,
        timedMode: false,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 10,
          timed: false,
        },
      });
    });

    it('should navigate with timed mode enabled', () => {
      const config = {
        questionCount: 20,
        timedMode: true,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 20,
          timed: true,
        },
      });
    });

    it('should handle large question count', () => {
      const config = {
        questionCount: 100,
        timedMode: false,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 100,
          timed: false,
        },
      });
    });

    it('should handle small question count', () => {
      const config = {
        questionCount: 5,
        timedMode: true,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 5,
          timed: true,
        },
      });
    });

    it('should call navigate only once per invocation', () => {
      const config = {
        questionCount: 10,
        timedMode: false,
      };

      component.onStartQuiz(config);
      expect(router.navigate).toHaveBeenCalledTimes(1);

      component.onStartQuiz(config);
      expect(router.navigate).toHaveBeenCalledTimes(2);
    });

    it('should preserve exact config values in state', () => {
      const config = {
        questionCount: 25,
        timedMode: true,
      };

      component.onStartQuiz(config);

      const navigationCall = router.navigate.mock.calls[0];
      expect(navigationCall[0]).toEqual(['/quiz/view']);
      expect(navigationCall[1]?.state?.['count']).toBe(25);
      expect(navigationCall[1]?.state?.['timed']).toBe(true);
    });
  });

  describe('Component Initialization', () => {
    it('should have router injected', () => {
      expect(component['_router']).toBeDefined();
    });

    it('should be standalone component', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });
});
