import { inject, Service } from '@angular/core';
import { EMPTY, expand, map, Observable, of, reduce, switchMap } from 'rxjs';
import { PrefetchAnswersGQL, PrefetchQuestionsGQL } from '../../../../graphql/generated';
import { Question } from '../../../../graphql/types';
import { parseTranslations } from '../../quiz/pipes/parse-translations.function';

interface PrefetchedAnswer {
  id: string;
  number: string;
  phrase: string | null;
  translations: unknown;
  questionId: string;
  isCorrect: boolean;
}

interface PrefetchedQuestion {
  id: string;
  number: string;
  phrase: string | null;
  translations: unknown;
  ruleId: string;
  ruleReferences: string[];
  answers: { id: string; number: string; phrase: string | null; translations: unknown }[];
}

interface PageResult<T> {
  nodes: T[];
  endCursor: string | null;
  hasNextPage: boolean;
}

/** Guards against a very broad offline query scanning/keeping thousands of matches; mirrors the backend's own `MaxPageSize` cap. */
const MAX_RESULTS = 100;

/**
 * Offline fallback for the `searchQuestions` GraphQL query. There is no native
 * full-text/fuzzy search engine available client-side, so this replicates a
 * "good enough" approximation entirely from the already-prefetched Apollo
 * cache: every search word must match at least one word across the
 * question/answer phrases, translations (all languages) and rule references,
 * either as a substring or within a small Levenshtein distance (to tolerate typos).
 */
@Service()
export class LocalSearchQuestionsService {
  private readonly _questionsGQL = inject(PrefetchQuestionsGQL);
  private readonly _answersGQL = inject(PrefetchAnswersGQL);

  search(searchTerm: string): Observable<Question[]> {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return of([]);

    const searchTokens = tokenize(trimmedTerm);
    if (searchTokens.length === 0) return of([]);

    return this.readAllQuestions().pipe(
      map((questions) => {
        // Mirror the backend's exact-match short-circuit: a verbatim number/phrase match on the
        // question or one of its answers, in any language, wins outright over fuzzy matches.
        const exactMatch = questions.find((q) => this.isExactMatch(trimmedTerm, q));
        return exactMatch ? [exactMatch] : questions.filter((q) => this.matches(searchTokens, q)).slice(0, MAX_RESULTS);
      }),
      switchMap((matched) =>
        this.readAnswersByQuestionId(matched.map((q) => q.id)).pipe(
          map((answersByQuestionId) => matched.map((q) => toQuestion(q, answersByQuestionId.get(q.id) ?? [])))
        )
      )
    );
  }

  private isExactMatch(term: string, question: PrefetchedQuestion): boolean {
    const normalizedTerm = term.toLowerCase();
    const candidates = [
      question.number,
      question.phrase ?? '',
      ...Object.values(parseTranslations(question.translations as string | Record<string, string> | null)),
      ...question.answers.flatMap((a) => [
        a.phrase ?? '',
        ...Object.values(parseTranslations(a.translations as string | Record<string, string> | null)),
      ]),
    ];
    return candidates.some((c) => c.trim().toLowerCase() === normalizedTerm);
  }

  private matches(searchTokens: string[], question: PrefetchedQuestion): boolean {
    const haystack = this.haystackTokens(question);
    return searchTokens.every((token) => haystack.some((h) => tokenMatches(token, h)));
  }

  private haystackTokens(question: PrefetchedQuestion): string[] {
    const texts = [
      question.number,
      question.phrase ?? '',
      ...Object.values(parseTranslations(question.translations as string | Record<string, string> | null)),
      ...question.ruleReferences,
      ...question.answers.flatMap((a) => [
        a.phrase ?? '',
        ...Object.values(parseTranslations(a.translations as string | Record<string, string> | null)),
      ]),
    ];
    return texts.flatMap(tokenize);
  }

  private readAllQuestions(): Observable<PrefetchedQuestion[]> {
    return this.paginate<PrefetchedQuestion>((cursor) =>
      this._questionsGQL.fetch({ variables: { cursor }, fetchPolicy: 'cache-only' }).pipe(
        map((result) => {
          const conn = result.data?.questions;
          return {
            nodes: (conn?.edges ?? []).map((e) => ({
              id: e.node.id,
              number: e.node.number,
              phrase: e.node.phrase,
              translations: e.node.translations,
              ruleId: e.node.ruleId,
              ruleReferences: e.node.ruleReferences,
              answers: e.node.answers?.nodes ?? [],
            })),
            endCursor: conn?.pageInfo?.endCursor ?? null,
            hasNextPage: conn?.pageInfo?.hasNextPage ?? false,
          };
        })
      )
    );
  }

  private readAnswersByQuestionId(questionIds: string[]): Observable<Map<string, PrefetchedAnswer[]>> {
    const wanted = new Set(questionIds);
    if (wanted.size === 0) return of(new Map());

    return this.paginate<PrefetchedAnswer>((cursor) =>
      this._answersGQL.fetch({ variables: { cursor }, fetchPolicy: 'cache-only' }).pipe(
        map((result) => {
          const conn = result.data?.answers;
          return {
            nodes: ((conn?.edges ?? []).map((e) => e.node) as PrefetchedAnswer[]).filter((a) =>
              wanted.has(a.questionId)
            ),
            endCursor: conn?.pageInfo?.endCursor ?? null,
            hasNextPage: conn?.pageInfo?.hasNextPage ?? false,
          };
        })
      )
    ).pipe(
      map((answers) => {
        const byQuestion = new Map<string, PrefetchedAnswer[]>();
        for (const a of answers) {
          const list = byQuestion.get(a.questionId);
          if (list) list.push(a);
          else byQuestion.set(a.questionId, [a]);
        }
        return byQuestion;
      })
    );
  }

  private paginate<T>(page: (cursor: string | null) => Observable<PageResult<T>>): Observable<T[]> {
    return page(null).pipe(
      expand((p) => (p.hasNextPage && p.endCursor ? page(p.endCursor) : EMPTY)),
      reduce<PageResult<T>, T[]>((acc, p) => acc.concat(p.nodes), [])
    );
  }
}

function toQuestion(question: PrefetchedQuestion, answers: PrefetchedAnswer[]): Question {
  return {
    __typename: 'Question',
    id: question.id,
    number: question.number,
    phrase: question.phrase,
    translations: question.translations,
    ruleId: question.ruleId,
    ruleReferences: question.ruleReferences,
    answers: {
      __typename: 'AnswersConnection',
      nodes: answers.map((a) => ({
        __typename: 'Answer',
        id: a.id,
        number: a.number,
        phrase: a.phrase,
        translations: a.translations,
        isCorrect: a.isCorrect,
      })),
    },
  } as unknown as Question;
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenMatches(searchToken: string, haystackToken: string): boolean {
  if (haystackToken.includes(searchToken)) return true;
  if (searchToken.length < 3) return false;
  const maxDistance = searchToken.length <= 4 ? 1 : 2;
  return levenshtein(searchToken, haystackToken) <= maxDistance;
}

/** Classic DP edit distance; inputs are short tokens so O(n*m) is negligible. */
function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return Number.MAX_SAFE_INTEGER;

  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
