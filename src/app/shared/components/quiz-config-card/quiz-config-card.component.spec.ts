import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { QuizConfig, QuizConfigCardComponent } from './quiz-config-card.component';

describe('QuizConfigCardComponent', () => {
  let component: QuizConfigCardComponent;
  let fixture: ComponentFixture<QuizConfigCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizConfigCardComponent, FormsModule],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizConfigCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default questionCount of 10', () => {
      expect(component.questionCount()).toBe(10);
    });

    it('should have default timedMode of false', () => {
      expect(component.timedMode()).toBe(false);
    });

    it('should have default title', () => {
      expect(component.title()).toBe('home.quiz_card.title');
    });

    it('should accept custom questionCount', () => {
      component.questionCount.set(20);
      fixture.detectChanges();

      expect(component.questionCount()).toBe(20);
    });

    it('should accept custom timedMode', () => {
      component.timedMode.set(true);
      fixture.detectChanges();

      expect(component.timedMode()).toBe(true);
    });

    it('should accept custom title', () => {
      fixture.componentRef.setInput('title', 'custom.title');
      fixture.detectChanges();

      expect(component.title()).toBe('custom.title');
    });
  });

  describe('FontAwesome Icons', () => {
    it('should have faClock icon defined', () => {
      expect(component.faClock).toBeDefined();
      expect(component.faClock.iconName).toBe('clock');
    });

    it('should have faArrowRight icon defined', () => {
      expect(component.faArrowRight).toBeDefined();
      expect(component.faArrowRight.iconName).toBe('arrow-right');
    });
  });

  describe('onStartQuiz', () => {
    it('should emit startQuiz event with default config', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);

      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(startSpy).toHaveBeenCalledWith({
        questionCount: 10,
        timedMode: false,
      });
    });

    it('should emit startQuiz event with custom questionCount', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);
      component.questionCount.set(25);

      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledWith({
        questionCount: 25,
        timedMode: false,
      });
    });

    it('should emit startQuiz event with timedMode enabled', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);
      component.timedMode.set(true);

      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledWith({
        questionCount: 10,
        timedMode: true,
      });
    });

    it('should emit startQuiz event with both custom values', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);
      component.questionCount.set(15);
      component.timedMode.set(true);

      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledWith({
        questionCount: 15,
        timedMode: true,
      });
    });

    it('should emit multiple times when called multiple times', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);

      component.onStartQuiz();
      component.onStartQuiz();
      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('QuizConfig Interface', () => {
    it('should emit config matching QuizConfig interface', () => {
      let emittedConfig: QuizConfig | undefined;
      component.startQuiz.subscribe((config: QuizConfig) => {
        emittedConfig = config;
      });

      component.questionCount.set(30);
      component.timedMode.set(true);
      component.onStartQuiz();

      expect(emittedConfig).toBeDefined();
      expect(emittedConfig?.questionCount).toBe(30);
      expect(emittedConfig?.timedMode).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle questionCount of 0', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);
      component.questionCount.set(0);

      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledWith({
        questionCount: 0,
        timedMode: false,
      });
    });

    it('should handle negative questionCount', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);
      component.questionCount.set(-5);

      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledWith({
        questionCount: -5,
        timedMode: false,
      });
    });

    it('should handle very large questionCount', () => {
      const startSpy = jest.fn();
      component.startQuiz.subscribe(startSpy);
      component.questionCount.set(999999);

      component.onStartQuiz();

      expect(startSpy).toHaveBeenCalledWith({
        questionCount: 999999,
        timedMode: false,
      });
    });
  });

  describe('Output EventEmitter', () => {
    it('should have startQuiz output defined', () => {
      expect(component.startQuiz).toBeDefined();
    });

    it('should allow multiple subscriptions to startQuiz event', () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      component.startQuiz.subscribe(subscriber1);
      component.startQuiz.subscribe(subscriber2);

      component.onStartQuiz();

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });
  });
});
