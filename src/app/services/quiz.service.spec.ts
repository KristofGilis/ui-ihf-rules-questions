import { TestBed } from '@angular/core/testing';
import { QuizService } from './quiz.service';
import { Answer, Question } from '../../../graphql/generated';

describe('QuizService', () => {
  let service: QuizService;

  const mockQuestions: Question[] = [
    {
      id: '1',
      number: 1,
      phrase: 'Question 1',
      answers: {
        nodes: [
          { id: 'a1', number: 1, phrase: 'Answer 1', isCorrect: true } as Answer,
          { id: 'a2', number: 2, phrase: 'Answer 2', isCorrect: false } as Answer,
        ],
      },
    } as Question,
    {
      id: '2',
      number: 2,
      phrase: 'Question 2',
      answers: {
        nodes: [
          { id: 'a3', number: 1, phrase: 'Answer 3', isCorrect: false } as Answer,
          { id: 'a4', number: 2, phrase: 'Answer 4', isCorrect: true } as Answer,
        ],
      },
    } as Question,
    {
      id: '3',
      number: 3,
      phrase: 'Question 3',
      answers: {
        nodes: [
          { id: 'a5', number: 1, phrase: 'Answer 5', isCorrect: true } as Answer,
          { id: 'a6', number: 2, phrase: 'Answer 6', isCorrect: true } as Answer,
        ],
      },
    } as Question,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startQuiz', () => {
    it('should initialize quiz with given questions', () => {
      service.startQuiz(mockQuestions, { questionCount: 2, timedMode: false });

      expect(service.quizQuestions().length).toBe(2);
      expect(service.currentQuestionIndex()).toBe(0);
      expect(service.isQuizActive()).toBe(true);
      expect(service.timedMode()).toBe(false);
    });

    it('should limit questions to questionCount', () => {
      service.startQuiz(mockQuestions, { questionCount: 1, timedMode: false });

      expect(service.quizQuestions().length).toBe(1);
    });

    it('should enable timed mode when configured', () => {
      service.startQuiz(mockQuestions, {
        questionCount: 2,
        timedMode: true,
        timePerQuestionSeconds: 30,
      });

      expect(service.timedMode()).toBe(true);
      expect(service.timeRemainingSeconds()).toBe(60);
    });

    it('should shuffle questions', () => {
      const questions = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          number: i,
          phrase: `Question ${i}`,
          answers: { nodes: [] },
        })) as Question[];

      service.startQuiz(questions, { questionCount: 10, timedMode: false });

      const quizQuestionIds = service.quizQuestions().map((q) => q.question.id);
      const originalIds = questions.slice(0, 10).map((q) => q.id);

      // With 10 questions, it's very unlikely they're in the same order
      const isSameOrder = quizQuestionIds.every((id, index) => id === originalIds[index]);
      expect(isSameOrder).toBe(false);
    });
  });

  describe('selectAnswer and deselectAnswer', () => {
    beforeEach(() => {
      service.startQuiz(mockQuestions, { questionCount: 2, timedMode: false });
    });

    it('should select an answer', () => {
      service.selectAnswer(0, 'a1');

      expect(service.quizQuestions()[0].selectedAnswerIds).toContain('a1');
    });

    it('should not add duplicate selections', () => {
      service.selectAnswer(0, 'a1');
      service.selectAnswer(0, 'a1');

      expect(service.quizQuestions()[0].selectedAnswerIds.filter((id) => id === 'a1').length).toBe(1);
    });

    it('should deselect an answer', () => {
      service.selectAnswer(0, 'a1');
      service.deselectAnswer(0, 'a1');

      expect(service.quizQuestions()[0].selectedAnswerIds).not.toContain('a1');
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      service.startQuiz(mockQuestions, { questionCount: 3, timedMode: false });
    });

    it('should navigate to next question', () => {
      service.nextQuestion();
      expect(service.currentQuestionIndex()).toBe(1);
    });

    it('should not navigate beyond last question', () => {
      service.currentQuestionIndex.set(2);
      service.nextQuestion();
      expect(service.currentQuestionIndex()).toBe(2);
    });

    it('should navigate to previous question', () => {
      service.currentQuestionIndex.set(1);
      service.previousQuestion();
      expect(service.currentQuestionIndex()).toBe(0);
    });

    it('should not navigate before first question', () => {
      service.previousQuestion();
      expect(service.currentQuestionIndex()).toBe(0);
    });
  });

  describe('finishQuiz', () => {
    beforeEach(() => {
      service.startQuiz(mockQuestions, { questionCount: 3, timedMode: false });
    });

    it('should calculate correct score with all correct answers', () => {
      service.selectAnswer(0, 'a1'); // Correct
      service.selectAnswer(1, 'a4'); // Correct
      service.selectAnswer(2, 'a5'); // Partial (needs a5 and a6)
      service.selectAnswer(2, 'a6'); // Complete

      const result = service.finishQuiz();

      expect(result.correctAnswers).toBe(3);
      expect(result.wrongAnswers).toBe(0);
      expect(result.percentage).toBe(100);
    });

    it('should calculate correct score with some wrong answers', () => {
      service.selectAnswer(0, 'a2'); // Wrong
      service.selectAnswer(1, 'a4'); // Correct
      service.selectAnswer(2, 'a5'); // Partial (missing a6)

      const result = service.finishQuiz();

      expect(result.correctAnswers).toBe(1);
      expect(result.wrongAnswers).toBe(2);
      expect(result.percentage).toBe(33);
    });

    it('should set isQuizActive to false', () => {
      service.finishQuiz();
      expect(service.isQuizActive()).toBe(false);
    });

    it('should store result in quizResult signal', () => {
      service.finishQuiz();
      expect(service.quizResult()).not.toBeNull();
    });
  });

  describe('resetQuiz', () => {
    it('should reset all quiz state', () => {
      service.startQuiz(mockQuestions, { questionCount: 2, timedMode: true, timePerQuestionSeconds: 30 });
      service.selectAnswer(0, 'a1');

      service.resetQuiz();

      expect(service.quizQuestions()).toEqual([]);
      expect(service.currentQuestionIndex()).toBe(0);
      expect(service.isQuizActive()).toBe(false);
      expect(service.timedMode()).toBe(false);
      expect(service.timeRemainingSeconds()).toBe(0);
      expect(service.quizResult()).toBeNull();
    });
  });
});
