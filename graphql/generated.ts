import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  UUID: { input: any; output: any };
};

/** IHF rule */
export type Answer = Node & {
  __typename?: 'Answer';
  /** The answer id */
  id: Scalars['ID']['output'];
  /** True if this is a correct answer, false if not */
  isCorrect: Scalars['Boolean']['output'];
  /** The answer number */
  number?: Maybe<Scalars['String']['output']>;
  /** The answer phrase based on the "Accept-Language" HTTP header */
  phrase?: Maybe<Scalars['String']['output']>;
  /** The question of this answer */
  question?: Maybe<Question>;
  /** The id the the rule */
  questionId: Scalars['ID']['output'];
};

/** Filter answers based on Id, Name, Number or if the answer is correct */
export type AnswerFilterInput = {
  and?: InputMaybe<Array<AnswerFilterInput>>;
  /** Filter on answer id */
  id?: InputMaybe<UuidOperationFilterInput>;
  /** Filter on answer number */
  number?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<AnswerFilterInput>>;
};

/** Sort answers based on Id, Name, Number or if the answer is correct */
export type AnswerSortInput = {
  /** Sort on answer id */
  id?: InputMaybe<SortEnumType>;
  /** Sort on answer number */
  number?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type AnswersConnection = {
  __typename?: 'AnswersConnection';
  /** A list of edges. */
  edges?: Maybe<Array<AnswersEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<Answer>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type AnswersEdge = {
  __typename?: 'AnswersEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node?: Maybe<Answer>;
};

export type IntOperationFilterInput = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
  ngt?: InputMaybe<Scalars['Int']['input']>;
  ngte?: InputMaybe<Scalars['Int']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  nlt?: InputMaybe<Scalars['Int']['input']>;
  nlte?: InputMaybe<Scalars['Int']['input']>;
};

/** The node interface is implemented by entities that have a global unique identifier. */
export type Node = {
  id: Scalars['ID']['output'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Indicates whether more edges exist following the set defined by the clients arguments. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Indicates whether more edges exist prior the set defined by the clients arguments. */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** IHF answer by id */
  answerById?: Maybe<Answer>;
  /** IHF answers of the game */
  answers?: Maybe<AnswersConnection>;
  /** IHF answers by ids */
  answersById?: Maybe<Array<Maybe<Answer>>>;
  /** Count the score for your questions based on the given answers */
  calculateScore?: Maybe<Score>;
  /** Fetches an object given its ID. */
  node?: Maybe<Node>;
  /** Lookup nodes by a list of IDs. */
  nodes: Array<Maybe<Node>>;
  /** IHF question by id */
  questionById?: Maybe<Question>;
  /** IHF questions of the game */
  questions?: Maybe<QuestionsConnection>;
  /** IHF questions by ids */
  questionsById?: Maybe<Array<Maybe<Question>>>;
  /** IHF rule by id */
  ruleById?: Maybe<Rule>;
  /** IHF Rules of the game */
  rules?: Maybe<RulesConnection>;
  /** IHF rules by ids */
  rulesById?: Maybe<Array<Maybe<Rule>>>;
  version?: Maybe<Scalars['String']['output']>;
};

export type QueryAnswerByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryAnswersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<AnswerSortInput>>;
  random?: Scalars['Boolean']['input'];
  where?: InputMaybe<AnswerFilterInput>;
};

export type QueryAnswersByIdArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type QueryCalculateScoreArgs = {
  questionIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  selectedAnswerIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type QueryQuestionByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryQuestionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<QuestionSortInput>>;
  random?: Scalars['Boolean']['input'];
  where?: InputMaybe<QuestionFilterInput>;
};

export type QueryQuestionsByIdArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type QueryRuleByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRulesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<RuleSortInput>>;
  random?: Scalars['Boolean']['input'];
  where?: InputMaybe<RuleFilterInput>;
};

export type QueryRulesByIdArgs = {
  ids: Array<Scalars['ID']['input']>;
};

/** IHF question */
export type Question = Node & {
  __typename?: 'Question';
  /** Question answers */
  answers?: Maybe<AnswersConnection>;
  /** The question id */
  id: Scalars['ID']['output'];
  /** The question number */
  number?: Maybe<Scalars['String']['output']>;
  /** The question phrase based on the "Accept-Language" HTTP header */
  phrase?: Maybe<Scalars['String']['output']>;
  /** The rule of this question */
  rule?: Maybe<Rule>;
  /** The id the the rule */
  ruleId: Scalars['ID']['output'];
};

/** IHF question */
export type QuestionAnswersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<AnswerSortInput>>;
  random?: InputMaybe<Scalars['Boolean']['input']>;
  where?: InputMaybe<AnswerFilterInput>;
};

/** Filter questions based on Id, Name or Number */
export type QuestionFilterInput = {
  and?: InputMaybe<Array<QuestionFilterInput>>;
  /** Filter on question id */
  id?: InputMaybe<UuidOperationFilterInput>;
  /** Filter on question number */
  number?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<QuestionFilterInput>>;
};

/** Sort questions based on Id, Phrase or Number */
export type QuestionSortInput = {
  /** Sort on question id */
  id?: InputMaybe<SortEnumType>;
  /** Sort on question number */
  number?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type QuestionsConnection = {
  __typename?: 'QuestionsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<QuestionsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<Question>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type QuestionsEdge = {
  __typename?: 'QuestionsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node?: Maybe<Question>;
};

/** IHF rule */
export type Rule = Node & {
  __typename?: 'Rule';
  /** The rule id */
  id: Scalars['ID']['output'];
  /** The name of the rule based on the "Accept-Language" HTTP header */
  name?: Maybe<Scalars['String']['output']>;
  /** The rule number */
  number?: Maybe<Scalars['String']['output']>;
  /** Rule questions */
  questions?: Maybe<QuestionsConnection>;
};

/** IHF rule */
export type RuleQuestionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<QuestionSortInput>>;
  random?: InputMaybe<Scalars['Boolean']['input']>;
  where?: InputMaybe<QuestionFilterInput>;
};

/** Filter rules based on Id, Name or Number */
export type RuleFilterInput = {
  and?: InputMaybe<Array<RuleFilterInput>>;
  /** Filter on rule id */
  id?: InputMaybe<UuidOperationFilterInput>;
  /** Filter on rule number */
  number?: InputMaybe<IntOperationFilterInput>;
  or?: InputMaybe<Array<RuleFilterInput>>;
};

/** Sort rules based on Id, Name or Number */
export type RuleSortInput = {
  /** Sort on rule id */
  id?: InputMaybe<SortEnumType>;
  /** Sort on rule number */
  number?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type RulesConnection = {
  __typename?: 'RulesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<RulesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<Rule>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type RulesEdge = {
  __typename?: 'RulesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node?: Maybe<Rule>;
};

/**
 * Score calculation based on following configuration:
 *                 Correct: 1,
 *                 Incorrect: -1,
 *                 Not answered: 0,
 *                 Negative score: False
 */
export type Score = {
  __typename?: 'Score';
  /** Your percentage score */
  percentage?: Maybe<Scalars['String']['output']>;
  /** Your score */
  score?: Maybe<Scalars['Int']['output']>;
  /** Total */
  total?: Maybe<Scalars['Int']['output']>;
  /** The answer ids that are not correct answered */
  wrongAnswerIds: Array<Scalars['ID']['output']>;
  /** The question ids that are not fully correct */
  wrongQuestionsIds: Array<Scalars['ID']['output']>;
};

export enum SortEnumType {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type StringOperationFilterInput = {
  and?: InputMaybe<Array<StringOperationFilterInput>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ncontains?: InputMaybe<Scalars['String']['input']>;
  nendsWith?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  nstartsWith?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<StringOperationFilterInput>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type UuidOperationFilterInput = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  gt?: InputMaybe<Scalars['UUID']['input']>;
  gte?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  lt?: InputMaybe<Scalars['UUID']['input']>;
  lte?: InputMaybe<Scalars['UUID']['input']>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
  ngt?: InputMaybe<Scalars['UUID']['input']>;
  ngte?: InputMaybe<Scalars['UUID']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  nlt?: InputMaybe<Scalars['UUID']['input']>;
  nlte?: InputMaybe<Scalars['UUID']['input']>;
};

export type CalculateScoreQueryVariables = Exact<{
  questionIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>> | InputMaybe<Scalars['ID']['input']>>;
  selectedAnswerIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>> | InputMaybe<Scalars['ID']['input']>>;
}>;

export type CalculateScoreQuery = {
  __typename?: 'Query';
  calculateScore?: {
    __typename?: 'Score';
    score?: number | null;
    total?: number | null;
    percentage?: string | null;
    wrongQuestionsIds: Array<string>;
  } | null;
};

export type GetQuestionsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<QuestionSortInput> | QuestionSortInput>;
  random?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type GetQuestionsQuery = {
  __typename?: 'Query';
  questions?: {
    __typename?: 'QuestionsConnection';
    edges?: Array<{
      __typename?: 'QuestionsEdge';
      cursor: string;
      node?: {
        __typename?: 'Question';
        id: string;
        number?: string | null;
        phrase?: string | null;
        answers?: {
          __typename?: 'AnswersConnection';
          nodes?: Array<{
            __typename?: 'Answer';
            id: string;
            number?: string | null;
            phrase?: string | null;
          } | null> | null;
        } | null;
      } | null;
    }> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
    };
  } | null;
};

export type GetRuleQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetRuleQuery = {
  __typename?: 'Query';
  ruleById?: {
    __typename?: 'Rule';
    id: string;
    number?: string | null;
    name?: string | null;
    questions?: {
      __typename?: 'QuestionsConnection';
      edges?: Array<{
        __typename?: 'QuestionsEdge';
        cursor: string;
        node?: {
          __typename?: 'Question';
          id: string;
          number?: string | null;
          phrase?: string | null;
          answers?: {
            __typename?: 'AnswersConnection';
            nodes?: Array<{
              __typename?: 'Answer';
              id: string;
              number?: string | null;
              phrase?: string | null;
            } | null> | null;
          } | null;
        } | null;
      }> | null;
      pageInfo: {
        __typename?: 'PageInfo';
        endCursor?: string | null;
        hasNextPage: boolean;
      };
    } | null;
  } | null;
};

export type GetRulesQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetRulesQuery = {
  __typename?: 'Query';
  rules?: {
    __typename?: 'RulesConnection';
    edges?: Array<{
      __typename?: 'RulesEdge';
      cursor: string;
      node?: {
        __typename?: 'Rule';
        id: string;
        number?: string | null;
        name?: string | null;
      } | null;
    }> | null;
    pageInfo: { __typename?: 'PageInfo'; endCursor?: string | null };
  } | null;
};

export type GetVersionQueryVariables = Exact<{ [key: string]: never }>;

export type GetVersionQuery = { __typename?: 'Query'; version?: string | null };

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
  providedIn: 'root',
})
export class CalculateScoreGQL extends Apollo.Query<CalculateScoreQuery, CalculateScoreQueryVariables> {
  document = CalculateScoreDocument;

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
          answers(order: [{ number: ASC }]) {
            nodes {
              id
              number
              phrase
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
  providedIn: 'root',
})
export class GetQuestionsGQL extends Apollo.Query<GetQuestionsQuery, GetQuestionsQueryVariables> {
  document = GetQuestionsDocument;

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
      questions(first: $first, after: $after, order: [{ number: ASC }]) {
        edges {
          cursor
          node {
            id
            number
            phrase
            answers(order: [{ number: ASC }]) {
              nodes {
                id
                number
                phrase
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
  providedIn: 'root',
})
export class GetRuleGQL extends Apollo.Query<GetRuleQuery, GetRuleQueryVariables> {
  document = GetRuleDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetRulesDocument = gql`
  query getRules($first: Int!, $after: String) {
    rules(first: $first, after: $after, order: { number: ASC }) {
      edges {
        cursor
        node {
          id
          number
          name
        }
      }
      pageInfo {
        endCursor
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetRulesGQL extends Apollo.Query<GetRulesQuery, GetRulesQueryVariables> {
  document = GetRulesDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetVersionDocument = gql`
  query getVersion {
    version
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetVersionGQL extends Apollo.Query<GetVersionQuery, GetVersionQueryVariables> {
  document = GetVersionDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
