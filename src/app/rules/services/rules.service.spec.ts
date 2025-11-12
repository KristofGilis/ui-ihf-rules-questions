import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { GetRulesGQL } from '../../../../graphql/generated';
import { RulesService } from './rules.service';

describe('RulesService', () => {
  let service: RulesService;
  let getRulesGQL: jest.Mocked<GetRulesGQL>;
  let rulesSubject: BehaviorSubject<any>;
  let fetchMoreMock: jest.Mock;
  let refetchMock: jest.Mock;

  const mockRulesResponse = {
    loading: false,
    data: {
      rules: {
        edges: [
          {
            cursor: 'cursor1',
            node: {
              id: 'r1',
              number: '1',
              name: 'Playing Court',
            },
          },
          {
            cursor: 'cursor2',
            node: {
              id: 'r2',
              number: '2',
              name: 'Playing Time, Final Signal and Time-Out',
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor2',
        },
      },
    },
  };

  beforeEach(() => {
    rulesSubject = new BehaviorSubject(mockRulesResponse);
    fetchMoreMock = jest.fn();
    refetchMock = jest.fn();

    const getRulesGQLMock = {
      watch: jest.fn().mockReturnValue({
        valueChanges: rulesSubject.asObservable(),
        fetchMore: fetchMoreMock,
        refetch: refetchMock,
      }),
    };

    TestBed.configureTestingModule({
      providers: [RulesService, { provide: GetRulesGQL, useValue: getRulesGQLMock }],
    });

    service = TestBed.inject(RulesService);
    getRulesGQL = TestBed.inject(GetRulesGQL) as jest.Mocked<GetRulesGQL>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Rules Query', () => {
    it('should fetch rules with correct parameters', (done) => {
      service.rules$.subscribe(() => {
        expect(getRulesGQL.watch).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: {
              first: 20,
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

    it('should update cursor from response', (done) => {
      service.rules$.subscribe(() => {
        // Cursor should be updated internally (private field)
        // We can verify this by checking if fetchMore uses the cursor
        service.fetchMore();
        expect(fetchMoreMock).toHaveBeenCalledWith({
          variables: {
            first: 20,
            after: 'cursor2',
          },
        });
        done();
      });
    });
  });

  describe('Loading State', () => {
    it('should emit loading state', (done) => {
      const loadingResponse = {
        ...mockRulesResponse,
        loading: true,
      };

      // Emit loading response
      rulesSubject.next(loadingResponse);

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
        done();
      });
    });

    it('should emit false when not loading', (done) => {
      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });

  describe('Pagination', () => {
    it('should fetch more rules with correct cursor', (done) => {
      service.rules$.subscribe(() => {
        service.fetchMore();

        expect(fetchMoreMock).toHaveBeenCalledWith({
          variables: {
            first: 20,
            after: 'cursor2',
          },
        });
        done();
      });
    });
  });

  describe('Refetch', () => {
    it('should reset cursor and refetch rules', () => {
      service.refetch();

      expect(refetchMock).toHaveBeenCalledWith({
        first: 20,
        after: null,
      });
    });
  });
});
