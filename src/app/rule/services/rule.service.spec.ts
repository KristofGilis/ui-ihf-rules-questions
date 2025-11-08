import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { GetRuleGQL } from '../../../../graphql/generated';
import { RuleService } from './rule.service';

describe('RuleService', () => {
  let service: RuleService;
  let getRuleGQL: jest.Mocked<GetRuleGQL>;
  let ruleSubject: BehaviorSubject<any>;
  let fetchMoreMock: jest.Mock;
  let refetchMock: jest.Mock;

  const mockRuleResponse = {
    loading: false,
    data: {
      ruleById: {
        id: 'r1',
        number: '1',
        name: 'Playing Court',
        questions: {
          edges: [
            {
              cursor: 'q-cursor1',
              node: {
                id: 'q1',
                number: '1',
                phrase: 'What is the length of the court?',
                answers: {
                  nodes: [
                    { id: 'a1', number: '1', phrase: '40m' },
                    { id: 'a2', number: '2', phrase: '38m' },
                  ],
                },
              },
            },
            {
              cursor: 'q-cursor2',
              node: {
                id: 'q2',
                number: '2',
                phrase: 'What is the width of the court?',
                answers: {
                  nodes: [
                    { id: 'a3', number: '1', phrase: '20m' },
                    { id: 'a4', number: '2', phrase: '18m' },
                  ],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: 'q-cursor2',
            hasNextPage: true,
          },
        },
      },
    },
  };

  beforeEach(() => {
    ruleSubject = new BehaviorSubject(mockRuleResponse);
    fetchMoreMock = jest.fn();
    refetchMock = jest.fn();

    const getRuleGQLMock = {
      watch: jest.fn().mockReturnValue({
        valueChanges: ruleSubject.asObservable(),
        fetchMore: fetchMoreMock,
        refetch: refetchMock,
      }),
    };

    TestBed.configureTestingModule({
      providers: [RuleService, { provide: GetRuleGQL, useValue: getRuleGQLMock }],
    });

    service = TestBed.inject(RuleService);
    getRuleGQL = TestBed.inject(GetRuleGQL) as jest.Mocked<GetRuleGQL>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should fetch rule with correct parameters', (done) => {
      service.get('r1').subscribe(() => {
        expect(getRuleGQL.watch).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: {
              id: 'r1',
              first: 10,
              after: null,
            },
            notifyOnNetworkStatusChange: true,
            refetchWritePolicy: 'overwrite',
            nextFetchPolicy: 'cache-first',
          })
        );
        done();
      });
    });

    it('should update cursor and hasNextPage from response', (done) => {
      service.get('r1').subscribe(() => {
        expect(service.hasNextPage).toBe(true);
        done();
      });
    });

    it('should handle response with no next page', (done) => {
      const responseWithoutNextPage = {
        ...mockRuleResponse,
        data: {
          ...mockRuleResponse.data,
          ruleById: {
            ...mockRuleResponse.data.ruleById,
            questions: {
              ...mockRuleResponse.data.ruleById.questions,
              pageInfo: {
                endCursor: 'q-cursor2',
                hasNextPage: false,
              },
            },
          },
        },
      };

      ruleSubject.next(responseWithoutNextPage);

      service.get('r1').subscribe(() => {
        expect(service.hasNextPage).toBe(false);
        done();
      });
    });

    it('should return observable that emits rule data', (done) => {
      service.get('r1').subscribe((result) => {
        expect(result.data?.ruleById?.id).toBe('r1');
        expect(result.data?.ruleById?.name).toBe('Playing Court');
        expect(result.data?.ruleById?.questions?.edges).toHaveLength(2);
        done();
      });
    });
  });

  describe('Pagination', () => {
    beforeEach((done) => {
      service.get('r1').subscribe(() => done());
    });

    it('should fetch more questions when hasNextPage is true', () => {
      service.fetchMoreQuestions();

      expect(fetchMoreMock).toHaveBeenCalledWith({
        variables: {
          first: 10,
          after: 'q-cursor2',
        },
      });
    });

    it('should not fetch more when hasNextPage is false', (done) => {
      const responseWithoutNextPage = {
        ...mockRuleResponse,
        data: {
          ...mockRuleResponse.data,
          ruleById: {
            ...mockRuleResponse.data.ruleById,
            questions: {
              ...mockRuleResponse.data.ruleById.questions,
              pageInfo: {
                endCursor: 'q-cursor2',
                hasNextPage: false,
              },
            },
          },
        },
      };

      ruleSubject.next(responseWithoutNextPage);

      service.rule$?.subscribe(() => {
        fetchMoreMock.mockClear();
        service.fetchMoreQuestions();
        expect(fetchMoreMock).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Refetch', () => {
    beforeEach((done) => {
      service.get('r1').subscribe(() => done());
    });

    it('should reset cursor and refetch rule questions', () => {
      service.refetch();

      expect(refetchMock).toHaveBeenCalledWith({
        first: 10,
        after: null,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not fetch more before get() is called', () => {
      service.fetchMoreQuestions();
      expect(fetchMoreMock).not.toHaveBeenCalled();
    });

    it('should not refetch before get() is called', () => {
      service.refetch();
      expect(refetchMock).not.toHaveBeenCalled();
    });

    it('should handle missing pageInfo in response', (done) => {
      const responseWithoutPageInfo = {
        loading: false,
        data: {
          ruleById: {
            id: 'r1',
            number: '1',
            name: 'Playing Court',
            questions: {
              edges: [],
              pageInfo: {},
            },
          },
        },
      };

      ruleSubject.next(responseWithoutPageInfo);

      service.get('r1').subscribe(() => {
        expect(service.hasNextPage).toBe(true); // Default value
        done();
      });
    });
  });
});
