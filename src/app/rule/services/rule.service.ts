import { Injectable, inject } from '@angular/core';
import { ObservableQuery } from '@apollo/client/core';
import { QueryRef } from 'apollo-angular';
import { Observable, tap } from 'rxjs';
import { GetRuleGQL, GetRuleQuery, GetRuleQueryVariables } from '../../../../graphql/generated';
import { ConnectivityService } from '../../services/connectivity.service';

@Injectable({
  providedIn: 'root',
})
export class RuleService {
  private _cursor?: string | null;
  private readonly _pageSize = 10;
  private readonly _getRuleGQL = inject(GetRuleGQL);
  private readonly _connectivity = inject(ConnectivityService);
  private _hasNextPage = true;

  private _ruleQuery?: QueryRef<GetRuleQuery, GetRuleQueryVariables>;

  rule$?: Observable<ObservableQuery.Result<GetRuleQuery>>;

  get hasNextPage(): boolean {
    return this._hasNextPage;
  }

  get(id: string): Observable<ObservableQuery.Result<GetRuleQuery>> {
    this._ruleQuery = this._getRuleGQL.watch({
      variables: {
        id,
        first: this._pageSize,
        after: null,
      },
      notifyOnNetworkStatusChange: true,
      refetchWritePolicy: 'overwrite',
      nextFetchPolicy: 'cache-first',
    });

    this.rule$ = this._ruleQuery.valueChanges.pipe(
      tap((x) => {
        this._cursor = x.data?.ruleById?.questions?.pageInfo?.endCursor;
        this._hasNextPage = x.data?.ruleById?.questions?.pageInfo?.hasNextPage ?? true;
      })
    );

    return this.rule$;
  }

  fetchMoreQuestions(): void {
    if (this._hasNextPage && this._connectivity.online) {
      this._ruleQuery?.fetchMore({
        variables: {
          first: this._pageSize,
          after: this._cursor,
        },
      });
    }
  }

  refetch(): void {
    this._ruleQuery?.refetch({ first: this._pageSize, after: null });
  }
}
