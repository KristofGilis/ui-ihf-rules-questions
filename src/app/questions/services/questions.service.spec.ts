import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { CalculateScoreGQL, GetQuestionsGQL } from '../../../../graphql/generated';
import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let getQuestionsGQL: jest.Mocked<GetQuestionsGQL>;
  let calculateScoreGQL: jest.Mocked<CalculateScoreGQL>;
  let questionsSubject: BehaviorSubject<any>;
  let fetchMoreMock: jest.Mock;
  let refetchMock: jest.Mock;

  const mockQuestionsResponse = {
    loading: false,
    data: {
      questions: {
        edges: [
          {
            cursor: 'cursor1',
            node: {
              id: 'q1',
              number: '1',
              phrase: 'Question 1',
              answers: {
                nodes: [
                  { id: 'a1', number: '1', phrase: 'Answer 1' },
                  { id: 'a2', number: '2', phrase: 'Answer 2' },
                ],
              },
            },
          },
          {
            cursor: 'cursor2',
            node: {
              id: 'q2',
              number: '2',
              phrase: 'Question 2',
              answers: {
                nodes: [
                  { id: 'a3', number: '1', phrase: 'Answer 3' },
                  { id: 'a4', number: '2', phrase: 'Answer 4' },
                ],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor2',
          hasNextPage: true,
        },
      },
    },
  };

  beforeEach(() => {
    questionsSubject = new BehaviorSubject(mockQuestionsResponse);
    fetchMoreMock = jest.fn();
    refetchMock = jest.fn();

    const getQuestionsGQLMock = {
      watch: jest.fn().mockReturnValue({
        valueChanges: questionsSubject.asObservable(),
        fetchMore: fetchMoreMock,
        refetch: refetchMock,
      }),
    };

    const calculateScoreGQLMock = {
      watch: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        QuestionsService,
        { provide: GetQuestionsGQL, useValue: getQuestionsGQLMock },
        { provide: CalculateScoreGQL, useValue: calculateScoreGQLMock },
      ],
    });

    service = TestBed.inject(QuestionsService);
    getQuestionsGQL = TestBed.inject(GetQuestionsGQL) as jest.Mocked<GetQuestionsGQL>;
    calculateScoreGQL = TestBed.inject(CalculateScoreGQL) as jest.Mocked<CalculateScoreGQL>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Questions Query', () => {
    it('should fetch questions with correct parameters', (done) => {
      service.questions$.subscribe(() => {
        expect(getQuestionsGQL.watch).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: expect.objectContaining({
              first: 10,
              after: null,
              random: false,
            }),
            notifyOnNetworkStatusChange: true,
            refetchWritePolicy: 'overwrite',
            nextFetchPolicy: 'cache-first',
          })
        );
        done();
      });
    });

    it('should update cursor and hasNextPage from response', (done) => {
      service.questions$.subscribe(() => {
        expect(service.hasNextPage).toBe(true);
        done();
      });
    });

    it('should handle response with no next page', (done) => {
      const responseWithoutNextPage = {
        ...mockQuestionsResponse,
        data: {
          questions: {
            ...mockQuestionsResponse.data.questions,
            pageInfo: {
              endCursor: 'cursor2',
              hasNextPage: false,
            },
          },
        },
      };

      // Emit new response
      questionsSubject.next(responseWithoutNextPage);

      service.questions$.subscribe(() => {
        expect(service.hasNextPage).toBe(false);
        done();
      });
    });

    it('should handle response with null or missing data', (done) => {
      const responseWithoutData = {
        ...mockQuestionsResponse,
        data: null,
      };

      questionsSubject.next(responseWithoutData);

      service.questions$.subscribe(() => {
        // Should default to null cursor and true for hasNextPage
        expect(service.hasNextPage).toBe(true);
        done();
      });
    });

    it('should handle response with missing pageInfo', (done) => {
      const responseWithoutPageInfo = {
        ...mockQuestionsResponse,
        data: {
          questions: {
            edges: mockQuestionsResponse.data.questions.edges,
            pageInfo: null as any,
          },
        },
      };

      questionsSubject.next(responseWithoutPageInfo);

      service.questions$.subscribe(() => {
        // Should default to null cursor and true for hasNextPage
        expect(service.hasNextPage).toBe(true);
        done();
      });
    });
  });

  describe('Pagination', () => {
    it('should fetch more questions when hasNextPage is true', (done) => {
      service.questions$.subscribe(() => {
        service.fetchMore();
        expect(fetchMoreMock).toHaveBeenCalledWith({
          variables: {
            after: 'cursor2',
          },
        });
        done();
      });
    });

    it('should not fetch more when hasNextPage is false', (done) => {
      const responseWithoutNextPage = {
        ...mockQuestionsResponse,
        data: {
          questions: {
            ...mockQuestionsResponse.data.questions,
            pageInfo: {
              endCursor: 'cursor2',
              hasNextPage: false,
            },
          },
        },
      };

      // Emit response without next page
      questionsSubject.next(responseWithoutNextPage);

      service.questions$.subscribe(() => {
        service.fetchMore();
        expect(fetchMoreMock).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Refetch', () => {
    it('should reset cursor and refetch questions', (done) => {
      service.questions$.subscribe(() => {
        service.refetch();

        expect(refetchMock).toHaveBeenCalledWith({
          first: 10,
          after: null,
          order: [{ number: 'ASC' }],
          random: false,
        });
        done();
      });
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score with provided question and answer IDs', (done) => {
      const mockScoreResponse = {
        loading: false,
        data: {
          calculateScore: {
            score: 8,
            total: 10,
            percentage: '80',
            wrongQuestionsIds: ['q3', 'q7'],
            wrongAnswerIds: ['a5', 'a14'],
          },
        },
      };

      calculateScoreGQL.watch.mockReturnValue({
        valueChanges: of(mockScoreResponse),
      } as any);

      const questionIds = ['q1', 'q2', 'q3'];
      const selectedAnswerIds = ['a1', 'a3', 'a5'];

      service.calculateScore(questionIds, selectedAnswerIds).subscribe((result) => {
        expect(calculateScoreGQL.watch).toHaveBeenCalledWith({
          variables: {
            questionIds,
            selectedAnswerIds,
          },
          fetchPolicy: 'no-cache',
        });

        expect(result.data?.calculateScore?.score).toBe(8);
        expect(result.data?.calculateScore?.total).toBe(10);
        expect(result.data?.calculateScore?.percentage).toBe('80');
        done();
      });
    });

    it('should use no-cache fetch policy for score calculation', () => {
      calculateScoreGQL.watch.mockReturnValue({
        valueChanges: of({
          loading: false,
          data: {
            calculateScore: {
              score: 5,
              total: 5,
              percentage: '100',
              wrongQuestionsIds: [],
              wrongAnswerIds: [],
            },
          },
        }),
      } as any);

      service.calculateScore(['q1'], ['a1']).subscribe();

      expect(calculateScoreGQL.watch).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchPolicy: 'no-cache',
        })
      );
    });
  });

  describe('debouncedScore$', () => {
    it('should provide debounced score calculation observable', () => {
      expect(service.debouncedScore$).toBeDefined();
    });

    it('should trigger score calculation through requestScore', (done) => {
      const scoreSubject = new BehaviorSubject({
        loading: false,
        data: { calculateScore: { score: 5, totalQuestions: 10 } },
      });

      calculateScoreGQL.watch = jest.fn(
        () =>
          ({
            valueChanges: scoreSubject.asObservable(),
            refetch: refetchMock,
            fetchMore: fetchMoreMock,
          }) as any
      );

      service.debouncedScore$.subscribe(() => {
        // Subscription active during debounce period
      });

      // Call requestScore
      service.requestScore(['q1'], ['a1']);

      // Wait for debounce time to complete
      setTimeout(() => {
        expect(calculateScoreGQL.watch).toHaveBeenCalledWith({
          variables: { questionIds: ['q1'], selectedAnswerIds: ['a1'] },
          fetchPolicy: 'no-cache',
        });
        done();
      }, 400);
    });

    it('should debounce multiple requestScore calls', (done) => {
      const scoreSubject = new BehaviorSubject({
        loading: false,
        data: { calculateScore: { score: 5, totalQuestions: 10 } },
      });

      calculateScoreGQL.watch = jest.fn(
        () =>
          ({
            valueChanges: scoreSubject.asObservable(),
            refetch: refetchMock,
            fetchMore: fetchMoreMock,
          }) as any
      );

      const subscription = service.debouncedScore$.subscribe(() => {
        // Subscription active during debounce period
      });

      service.requestScore(['q1'], ['a1']);
      service.requestScore(['q1'], ['a2']);
      service.requestScore(['q1'], ['a3']);

      // Wait for debounce (300ms) + safety margin
      setTimeout(() => {
        // Should only be called once due to debounce, with the last args
        expect(calculateScoreGQL.watch).toHaveBeenCalledTimes(1);
        expect(calculateScoreGQL.watch).toHaveBeenCalledWith({
          variables: { questionIds: ['q1'], selectedAnswerIds: ['a3'] },
          fetchPolicy: 'no-cache',
        });
        subscription.unsubscribe();
        done();
      }, 350);
    });
  });
});
