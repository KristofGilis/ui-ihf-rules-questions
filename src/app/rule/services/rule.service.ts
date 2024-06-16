import { Injectable, inject } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { QueryRef } from 'apollo-angular';
import { Observable, tap } from 'rxjs';
import {
  GetRuleGQL,
  GetRuleQuery,
  GetRuleQueryVariables,
} from '../../../../graphql/generated';

@Injectable({
  providedIn: 'root',
})
export class RuleService {
  // private _ruleId: string;
  private _cursor?: string | null;
  private _pageSize = 10;
  private _getRuleGQL = inject(GetRuleGQL);
  private _hasNextPage = true;

  private _ruleQuery?: QueryRef<GetRuleQuery, GetRuleQueryVariables>;

  rule$?: Observable<ApolloQueryResult<GetRuleQuery>>;

  get hasNextPage(): boolean {
    return this._hasNextPage;
  }

  get(id: string): Observable<ApolloQueryResult<GetRuleQuery>> {
    // this._ruleId = id;
    this._ruleQuery = this._getRuleGQL.watch(
      {
        id,
        first: this._pageSize,
        after: null,
      },
      { notifyOnNetworkStatusChange: true }
    );

    this.rule$ = this._ruleQuery.valueChanges.pipe(
      tap((x) => {
        this._cursor = x.data?.ruleById?.questions?.pageInfo.endCursor;
        this._hasNextPage =
          x.data?.ruleById?.questions?.pageInfo.hasNextPage ?? true;
      })
    );

    return this.rule$;
  }

  fetchMoreQuestions(): void {
    if (this._hasNextPage) {
      this._ruleQuery?.fetchMore({
        variables: {
          first: this._pageSize,
          after: this._cursor,
        },
      });
    }
  }
}
