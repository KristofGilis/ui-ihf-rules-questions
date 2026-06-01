/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
/** Sort questions based on Id, Phrase or Number */
export type QuestionSortInput = {
  /** Sort on question id */
  id?: SortEnumType | null | undefined;
  /** Sort on question number */
  number?: SortEnumType | null | undefined;
};

export type SortEnumType =
  | 'ASC'
  | 'DESC';

export type PrefetchAnswersQueryVariables = Exact<{
  cursor?: string | null | undefined;
}>;


export type PrefetchAnswersQuery = { answers: { edges: Array<{ cursor: string, node: { id: string, number: string, phrase: string | null, translations: unknown, questionId: string, isCorrect: boolean } }> | null, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type PrefetchLanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type PrefetchLanguagesQuery = { languages: Array<string> };

export type PrefetchQuestionsQueryVariables = Exact<{
  cursor?: string | null | undefined;
}>;


export type PrefetchQuestionsQuery = { questions: { edges: Array<{ cursor: string, node: { id: string, number: string, phrase: string | null, translations: unknown, ruleId: string, answers: { nodes: Array<{ id: string, number: string, phrase: string | null, translations: unknown }> | null } } }> | null, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type PrefetchRulesQueryVariables = Exact<{
  cursor?: string | null | undefined;
}>;


export type PrefetchRulesQuery = { rules: { edges: Array<{ cursor: string, node: { id: string, number: string, name: string | null, translations: unknown } }> | null, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type PrefetchScoreConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type PrefetchScoreConfigurationQuery = { scoreConfiguration: { correct: number, inCorrect: number, notAnswered: number, negativeScore: boolean, penalizeGuessingStrategy: boolean } };

export type PrefetchVersionsQueryVariables = Exact<{ [key: string]: never; }>;


export type PrefetchVersionsQuery = { versions: unknown };

export type CalculateScoreQueryVariables = Exact<{
  questionIds?: Array<string | number | null | undefined> | string | number | null | undefined;
  selectedAnswerIds?: Array<string | number | null | undefined> | string | number | null | undefined;
}>;


export type CalculateScoreQuery = { calculateScore: { score: number, total: number, percentage: string | null, wrongQuestionsIds: Array<string> } };

export type GetQuestionsQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
  order?: Array<QuestionSortInput> | QuestionSortInput | null | undefined;
  random?: boolean | null | undefined;
}>;


export type GetQuestionsQuery = { questions: { edges: Array<{ cursor: string, node: { id: string, number: string, phrase: string | null, translations: unknown, answers: { nodes: Array<{ id: string, number: string, phrase: string | null, translations: unknown }> | null } } }> | null, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type GetRuleQueryVariables = Exact<{
  id: string | number;
  first: number;
  after?: string | null | undefined;
}>;


export type GetRuleQuery = { ruleById: { id: string, number: string, name: string | null, translations: unknown, questions: { edges: Array<{ cursor: string, node: { id: string, number: string, phrase: string | null, translations: unknown, answers: { nodes: Array<{ id: string, number: string, phrase: string | null, translations: unknown }> | null } } }> | null, pageInfo: { endCursor: string | null, hasNextPage: boolean } } } | null };

export type GetRulesQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type GetRulesQuery = { rules: { edges: Array<{ cursor: string, node: { id: string, number: string, name: string | null, translations: unknown } }> | null, pageInfo: { endCursor: string | null } } };

export const PrefetchAnswersDocument = gql`
    query prefetchAnswers($cursor: String) {
  answers(first: 50, after: $cursor, order: {number: ASC}) {
    edges {
      cursor
      node {
        id
        number
        phrase
        translations
        questionId
        isCorrect
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class PrefetchAnswersGQL extends Apollo.Query<PrefetchAnswersQuery, PrefetchAnswersQueryVariables> {
    override document = PrefetchAnswersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const PrefetchLanguagesDocument = gql`
    query prefetchLanguages {
  languages
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class PrefetchLanguagesGQL extends Apollo.Query<PrefetchLanguagesQuery, PrefetchLanguagesQueryVariables> {
    override document = PrefetchLanguagesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const PrefetchQuestionsDocument = gql`
    query prefetchQuestions($cursor: String) {
  questions(first: 50, after: $cursor, order: [{number: ASC}], random: false) {
    edges {
      cursor
      node {
        id
        number
        phrase
        translations
        ruleId
        answers(order: {number: ASC}) {
          nodes {
            id
            number
            phrase
            translations
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class PrefetchQuestionsGQL extends Apollo.Query<PrefetchQuestionsQuery, PrefetchQuestionsQueryVariables> {
    override document = PrefetchQuestionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const PrefetchRulesDocument = gql`
    query prefetchRules($cursor: String) {
  rules(first: 50, after: $cursor, order: {number: ASC}) {
    edges {
      cursor
      node {
        id
        number
        name
        translations
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class PrefetchRulesGQL extends Apollo.Query<PrefetchRulesQuery, PrefetchRulesQueryVariables> {
    override document = PrefetchRulesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const PrefetchScoreConfigurationDocument = gql`
    query prefetchScoreConfiguration {
  scoreConfiguration {
    correct
    inCorrect
    notAnswered
    negativeScore
    penalizeGuessingStrategy
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class PrefetchScoreConfigurationGQL extends Apollo.Query<PrefetchScoreConfigurationQuery, PrefetchScoreConfigurationQueryVariables> {
    override document = PrefetchScoreConfigurationDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const PrefetchVersionsDocument = gql`
    query prefetchVersions {
  versions
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class PrefetchVersionsGQL extends Apollo.Query<PrefetchVersionsQuery, PrefetchVersionsQueryVariables> {
    override document = PrefetchVersionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CalculateScoreDocument = gql`
    query calculateScore($questionIds: [ID], $selectedAnswerIds: [ID]) {
  calculateScore(questionIds: $questionIds, selectedAnswerIds: $selectedAnswerIds) {
    score
    total
    percentage
    wrongQuestionsIds
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CalculateScoreGQL extends Apollo.Query<CalculateScoreQuery, CalculateScoreQueryVariables> {
    override document = CalculateScoreDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetQuestionsDocument = gql`
    query getQuestions($first: Int!, $after: String, $order: [QuestionSortInput!], $random: Boolean = false) {
  questions(first: $first, after: $after, order: $order, random: $random) {
    edges {
      cursor
      node {
        id
        number
        phrase
        translations
        answers(order: {number: ASC}) {
          nodes {
            id
            number
            phrase
            translations
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetQuestionsGQL extends Apollo.Query<GetQuestionsQuery, GetQuestionsQueryVariables> {
    override document = GetQuestionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetRuleDocument = gql`
    query getRule($id: ID!, $first: Int!, $after: String) {
  ruleById(id: $id) {
    id
    number
    name
    translations
    questions(first: $first, after: $after, order: [{number: ASC}]) {
      edges {
        cursor
        node {
          id
          number
          phrase
          translations
          answers(order: [{number: ASC}]) {
            nodes {
              id
              number
              phrase
              translations
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetRuleGQL extends Apollo.Query<GetRuleQuery, GetRuleQueryVariables> {
    override document = GetRuleDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetRulesDocument = gql`
    query getRules($first: Int!, $after: String) {
  rules(first: $first, after: $after, order: {number: ASC}) {
    edges {
      cursor
      node {
        id
        number
        name
        translations
      }
    }
    pageInfo {
      endCursor
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetRulesGQL extends Apollo.Query<GetRulesQuery, GetRulesQueryVariables> {
    override document = GetRulesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }