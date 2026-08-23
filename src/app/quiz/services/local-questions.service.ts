import { inject, Service } from '@angular/core';
import { EMPTY, expand, iif, map, Observable, of, reduce, switchMap } from 'rxjs';
import { PrefetchAnswersGQL, PrefetchQuestionsGQL } from '../../../../graphql/generated';
import { Question } from '../../../../graphql/types';
import { shuffle } from './seeded-rng';

interface PrefetchedQuestion {
  id: string;
  number: string;
  phrase: string | null;
  translations: unknown;
  ruleId: string;
  ruleReferences: string[];
  answers: {
    nodes: Array<{
      id: string;
      number: string;
      phrase: string | null;
      translations: unknown;
    }> | null;
  };
}

interface PrefetchedAnswer {
  id: string;
  number: string;
  phrase: string | null;
  translations: unknown;
  questionId: string;
  isCorrect: boolean;
}

interface PageResult<T> {
  nodes: T[];
  endCursor: string | null;
  hasNextPage: boolean;
}

/**
 * Reads the prefetched questions + answers from the Apollo cache (no network)
 * and exposes a random-question selector for the offline quiz path.
 *
 * Output shape matches `Question` (see graphql/types.ts) so it can be consumed
 * by `QuizService.initializeQuiz` without branching.
 */
@Service()
export class LocalQuestionsService {
  private readonly _questionsGQL = inject(PrefetchQuestionsGQL);
  private readonly _answersGQL = inject(PrefetchAnswersGQL);

  /** Returns up to `count` distinct random questions assembled from the cache. */
  getRandomQuestions(count: number, rng: () => number): Observable<Question[]> {
    return this.readAllQuestions().pipe(
      switchMap((questions) => {
        const needsHydration = questions.some((q) => !q.answers?.nodes || q.answers.nodes.length === 0);
        return iif(
          () => needsHydration,
          this.readAnswersByQuestionId().pipe(map((answers) => this.assemble(questions, count, rng, answers))),
          of(this.assemble(questions, count, rng, null))
        );
      })
    );
  }

  private assemble(
    questions: PrefetchedQuestion[],
    count: number,
    rng: () => number,
    answersByQuestionId: Map<string, PrefetchedAnswer[]> | null
  ): Question[] {
    if (questions.length === 0) return [];
    const picked = shuffle(questions, rng).slice(0, Math.min(count, questions.length));
    return picked.map((q) => {
      const nestedNodes = q.answers?.nodes;
      const answersSource =
        nestedNodes && nestedNodes.length > 0
          ? nestedNodes
          : (answersByQuestionId?.get(q.id) ?? []).map((a) => ({
              id: a.id,
              number: a.number,
              phrase: a.phrase,
              translations: a.translations,
            }));

      const shuffledAnswers = shuffle(answersSource, rng);

      return {
        id: q.id,
        number: q.number,
        phrase: q.phrase,
        translations: q.translations,
        ruleReferences: q.ruleReferences ?? [],
        answers: { nodes: shuffledAnswers },
      } as unknown as Question;
    });
  }

  private readAllQuestions(): Observable<PrefetchedQuestion[]> {
    return this.paginate<PrefetchedQuestion>((cursor) =>
      this._questionsGQL.fetch({ variables: { cursor }, fetchPolicy: 'cache-only' }).pipe(
        map((result) => {
          const conn = (
            result as {
              data?: {
                questions?: {
                  edges?: { node: PrefetchedQuestion }[] | null;
                  pageInfo: { endCursor: string | null; hasNextPage: boolean };
                } | null;
              };
            }
          ).data?.questions;
          return {
            nodes: (conn?.edges ?? []).map((e) => e.node) as PrefetchedQuestion[],
            endCursor: conn?.pageInfo?.endCursor ?? null,
            hasNextPage: conn?.pageInfo?.hasNextPage ?? false,
          };
        })
      )
    );
  }

  private readAnswersByQuestionId(): Observable<Map<string, PrefetchedAnswer[]>> {
    return this.paginate<PrefetchedAnswer>((cursor) =>
      this._answersGQL.fetch({ variables: { cursor }, fetchPolicy: 'cache-only' }).pipe(
        map((result) => {
          const conn = (
            result as {
              data?: {
                answers?: {
                  edges?: { node: PrefetchedAnswer }[] | null;
                  pageInfo: { endCursor: string | null; hasNextPage: boolean };
                } | null;
              };
            }
          ).data?.answers;
          return {
            nodes: (conn?.edges ?? []).map((e) => e.node) as PrefetchedAnswer[],
            endCursor: conn?.pageInfo?.endCursor ?? null,
            hasNextPage: conn?.pageInfo?.hasNextPage ?? false,
          };
        })
      )
    ).pipe(
      map((all) => {
        const grouped = new Map<string, PrefetchedAnswer[]>();
        for (const a of all) {
          const list = grouped.get(a.questionId);
          if (list) list.push(a);
          else grouped.set(a.questionId, [a]);
        }
        return grouped;
      })
    );
  }

  /** Generic cursor-based pagination that aggregates all pages into one array. */
  private paginate<T>(page: (cursor: string | null) => Observable<PageResult<T>>): Observable<T[]> {
    return page(null).pipe(
      expand((p) => (p.hasNextPage && p.endCursor ? page(p.endCursor) : EMPTY)),
      reduce<PageResult<T>, T[]>((acc, p) => acc.concat(p.nodes), [])
    );
  }
}
