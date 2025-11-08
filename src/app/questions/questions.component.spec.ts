import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Question, Score } from '../../../graphql/generated';
import { QuestionsComponent } from './questions.component';
import { QuestionsService } from './services/questions.service';

describe('QuestionsComponent', () => {
  let component: QuestionsComponent;
  let fixture: ComponentFixture<QuestionsComponent>;
  let questionsService: jest.Mocked<QuestionsService>;

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
    const questionsServiceMock = {
      questions$: of({
        data: {
          questions: {
            edges: mockQuestions.map((q) => ({ node: q })),
          },
        },
        dataState: 'complete' as const,
        loading: false,
        networkStatus: 7,
        partial: false,
      }),
      calculateScore: jest.fn().mockReturnValue(
        of({
          data: { calculateScore: mockScore },
          dataState: 'complete' as const,
          loading: false,
          networkStatus: 7,
          partial: false,
        })
      ),
      hasNextPage: false,
      fetchMore: jest.fn(),
      refetch: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuestionsComponent],
      providers: [provideTranslateService(), { provide: QuestionsService, useValue: questionsServiceMock }],
    }).compileComponents();

    questionsService = TestBed.inject(QuestionsService) as jest.Mocked<QuestionsService>;
    fixture = TestBed.createComponent(QuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading signal', () => {
    it('should start with loading false', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('questions$', () => {
    it('should transform questions into Question array', (done) => {
      component.questions$.subscribe((questions) => {
        expect(questions).toHaveLength(2);
        expect(questions[0].id).toBe('1');
        expect(questions[1].id).toBe('2');
        done();
      });
    });
  });

  describe('hasMoreQuestions', () => {
    it('should return service hasNextPage value', () => {
      expect(component.hasMoreQuestions).toBe(false);
    });
  });

  describe('onRestart', () => {
    it('should set scoreLoading to false', () => {
      component.scoreLoading.set(true);
      component.onRestart();
      expect(component.scoreLoading()).toBe(false);
    });
  });
});
