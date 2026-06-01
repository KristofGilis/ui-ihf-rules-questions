import { inject, Injectable } from '@angular/core';
import { catchError, combineLatest, EMPTY, expand, map, Observable, of, reduce } from 'rxjs';
import { PrefetchAnswersGQL, PrefetchScoreConfigurationGQL } from '../../../../graphql/generated';
import { Score } from '../../../../graphql/types';

interface PrefetchedAnswer {
  id: string;
  isCorrect: boolean;
  questionId: string;
}

interface ScoreConfiguration {
  correct: number;
  inCorrect: number;
  notAnswered: number;
  negativeScore: boolean;
  penalizeGuessingStrategy: boolean;
}

interface PageResult<T> {
  nodes: T[];
  endCursor: string | null;
  hasNextPage: boolean;
}

const DEFAULT_SCORE_CONFIG: ScoreConfiguration = {
  correct: 1,
  inCorrect: -1,
  notAnswered: 0,
  negativeScore: false,
  penalizeGuessingStrategy: true,
};

/**
 * Client-side port of the backend `ScoreCalculationQueries.CalculateScore`.
 * Used when offline so the quiz can still produce a score without the server.
 * Output shape matches `CalculateScoreQuery['calculateScore']` so callers can
 * be agnostic about the source.
 */
@Injectable({ providedIn: 'root' })
export class LocalScoreService {
  private readonly _answersGQL = inject(PrefetchAnswersGQL);
  private readonly _scoreConfigGQL = inject(PrefetchScoreConfigurationGQL);

  calculateScore(
    questionIds: string[],
    selectedAnswerIds: string[],
    overrides?: Partial<ScoreConfiguration>
  ): Observable<Score> {
    return combineLatest([this.readConfig(), this.readAnswersForQuestions(questionIds)]).pipe(
      map(([cfgFromCache, allAnswers]) => {
        const config = { ...DEFAULT_SCORE_CONFIG, ...cfgFromCache, ...(overrides ?? {}) };
        return this.scoreFor(questionIds, selectedAnswerIds, allAnswers, config);
      })
    );
  }

  private scoreFor(
    questionIds: string[],
    selectedAnswerIds: string[],
    allAnswers: PrefetchedAnswer[],
    config: ScoreConfiguration
  ): Score {
    const selectedSet = new Set(selectedAnswerIds);
    const answersByQuestion = new Map<string, PrefetchedAnswer[]>();
    for (const a of allAnswers) {
      const list = answersByQuestion.get(a.questionId);
      if (list) list.push(a);
      else answersByQuestion.set(a.questionId, [a]);
    }

    const total = allAnswers.reduce((acc, a) => acc + (a.isCorrect ? 1 : 0), 0);
    let score = 0;
    const wrongQuestionIds = new Set<string>();

    for (const questionId of questionIds) {
      const answers = answersByQuestion.get(questionId) ?? [];
      let scoreForQuestion = 0;
      let hasWrongAnswer = false;

      const allSelected = answers.length > 0 && answers.every((a) => selectedSet.has(a.id));

      if (config.penalizeGuessingStrategy && allSelected) {
        scoreForQuestion = 0;
        wrongQuestionIds.add(questionId);
      } else {
        for (const a of answers) {
          const isSelected = selectedSet.has(a.id);
          if (a.isCorrect && isSelected) {
            scoreForQuestion += config.correct;
          } else if (a.isCorrect && !isSelected) {
            hasWrongAnswer = true;
            scoreForQuestion += config.notAnswered;
          } else if (!a.isCorrect && isSelected) {
            hasWrongAnswer = true;
            scoreForQuestion += config.inCorrect;
          }
        }
        if (hasWrongAnswer) wrongQuestionIds.add(questionId);
        if (!config.negativeScore) scoreForQuestion = Math.max(0, scoreForQuestion);
      }

      score += scoreForQuestion;
    }

    // Order wrong ids to match input order (mirrors backend ordering).
    const orderedWrongQuestionIds = questionIds.filter((id) => wrongQuestionIds.has(id));
    const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : '0.00';

    return {
      __typename: 'ScoreCalculation' as never,
      score,
      total,
      percentage,
      wrongQuestionsIds: orderedWrongQuestionIds,
    } as unknown as Score;
  }

  private readConfig(): Observable<Partial<ScoreConfiguration>> {
    return this._scoreConfigGQL.fetch({ fetchPolicy: 'cache-only' }).pipe(
      map((result) => {
        const cfg = (result as { data?: { scoreConfiguration?: ScoreConfiguration | null } }).data?.scoreConfiguration;
        if (!cfg) return {};
        return {
          correct: cfg.correct,
          inCorrect: cfg.inCorrect,
          notAnswered: cfg.notAnswered,
          negativeScore: cfg.negativeScore,
          penalizeGuessingStrategy: cfg.penalizeGuessingStrategy,
        };
      }),
      catchError(() => of({} as Partial<ScoreConfiguration>))
    );
  }

  private readAnswersForQuestions(questionIds: string[]): Observable<PrefetchedAnswer[]> {
    const wanted = new Set(questionIds);
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
            nodes: ((conn?.edges ?? []).map((e) => e.node) as PrefetchedAnswer[]).filter((a) =>
              wanted.has(a.questionId)
            ),
            endCursor: conn?.pageInfo?.endCursor ?? null,
            hasNextPage: conn?.pageInfo?.hasNextPage ?? false,
          };
        })
      )
    );
  }

  private paginate<T>(page: (cursor: string | null) => Observable<PageResult<T>>): Observable<T[]> {
    return page(null).pipe(
      expand((p) => (p.hasNextPage && p.endCursor ? page(p.endCursor) : EMPTY)),
      reduce<PageResult<T>, T[]>((acc, p) => acc.concat(p.nodes), [])
    );
  }
}
