import { Injectable, inject } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Observable, tap } from 'rxjs';
import {
  CalculateScoreGQL,
  CalculateScoreQuery,
  GetQuestionsGQL,
  QuestionSortInput,
  SortEnumType,
} from '../../../../graphql/generated';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private _cursor?: string | null;
  private _hasNextPage = true;
  private _random = false;
  private _order: QuestionSortInput[] = [{ number: SortEnumType.Asc }];
  private _pageSize = 10;
  private _getQuestionsGQL = inject(GetQuestionsGQL);
  private _questionsQuery = this._getQuestionsGQL.watch(
    {
      first: this._pageSize,
      after: null,
      order: this._order,
      random: this._random,
    },
    {
      notifyOnNetworkStatusChange: true,
    }
  );
  private _calculateScoreGQL = inject(CalculateScoreGQL);

  get hasNextPage(): boolean {
    return this._hasNextPage;
  }

  questions$ = this._questionsQuery.valueChanges.pipe(
    tap((x) => {
      this._cursor = x.data?.questions?.pageInfo.endCursor;
      if (!this._random) {
        this._hasNextPage = x.data?.questions?.pageInfo.hasNextPage ?? true;
      } else {
        this._hasNextPage = false;
      }
    })
  );

  fetchMore(): void {
    if (this._hasNextPage && !this._random) {
      this._questionsQuery.fetchMore({
        variables: {
          first: this._pageSize,
          after: this._cursor,
          order: this._order,
          random: this._random,
        },
      });
    }
  }

  getRandom(count: number): void {
    this._order = [];
    this._random = true;
    this._pageSize = count;
    this._questionsQuery.refetch({
      first: this._pageSize,
      after: null,
      order: this._order,
      random: this._random,
    });
  }

  getAll(): void {
    this._order = [{ number: SortEnumType.Asc }];
    this._random = false;
    this._pageSize = 10;
    this._questionsQuery.refetch({
      first: this._pageSize,
      after: null,
      order: this._order,
      random: this._random,
    });
  }

  calculateScore(
    questionIds: string[],
    selectedAnswerIds: string[]
  ): Observable<ApolloQueryResult<CalculateScoreQuery>> {
    return this._calculateScoreGQL.watch(
      {
        questionIds,
        selectedAnswerIds,
      },
      { fetchPolicy: 'no-cache' }
    ).valueChanges;
  }
}
