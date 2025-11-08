import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CalculateScoreGQL, GetQuestionsGQL } from '../../../../graphql/generated';
import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let getQuestionsGQL: jest.Mocked<GetQuestionsGQL>;
  let calculateScoreGQL: jest.Mocked<CalculateScoreGQL>;

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
    const fetchMoreMock = jest.fn();
    const refetchMock = jest.fn();

    const getQuestionsGQLMock = {
      watch: jest.fn().mockReturnValue({
        valueChanges: of(mockQuestionsResponse),
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

      getQuestionsGQL.watch.mockReturnValue({
        valueChanges: of(responseWithoutNextPage),
        fetchMore: jest.fn(),
        refetch: jest.fn(),
      } as any);

      service.questions$.subscribe(() => {
        expect(service.hasNextPage).toBe(false);
        done();
      });
    });
  });

  describe('Pagination', () => {
    let fetchMoreMock: jest.Mock;

    beforeEach(() => {
      fetchMoreMock = jest.fn();
      getQuestionsGQL.watch.mockReturnValue({
        valueChanges: of(mockQuestionsResponse),
        fetchMore: fetchMoreMock,
        refetch: jest.fn(),
      } as any);
    });

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

      getQuestionsGQL.watch.mockReturnValue({
        valueChanges: of(responseWithoutNextPage),
        fetchMore: fetchMoreMock,
        refetch: jest.fn(),
      } as any);

      service.questions$.subscribe(() => {
        service.fetchMore();
        expect(fetchMoreMock).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Refetch', () => {
    it('should reset cursor and refetch questions', (done) => {
      const refetchMock = jest.fn();
      getQuestionsGQL.watch.mockReturnValue({
        valueChanges: of(mockQuestionsResponse),
        fetchMore: jest.fn(),
        refetch: refetchMock,
      } as any);

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
});
