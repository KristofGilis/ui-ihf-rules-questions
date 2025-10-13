import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { GetRulesGQL } from '../../../../graphql/generated';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private _cursor?: string | null;
  private readonly _pageSize = 20;
  private readonly _getRulesGQL = inject(GetRulesGQL);
  private readonly _rulesQuery = this._getRulesGQL.watch({
    variables: {
      first: this._pageSize,
      after: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  rules$ = this._rulesQuery.valueChanges.pipe(tap((x) => (this._cursor = x.data?.rules?.pageInfo?.endCursor)));

  fetchMore(): void {
    this._rulesQuery.fetchMore({
      variables: {
        first: this._pageSize,
        after: this._cursor,
      },
    });
  }

  refetch(): void {
    this._rulesQuery.refetch({ first: this._pageSize, after: null });
  }
}
