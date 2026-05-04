import { CalculateScoreQuery, GetQuestionsQuery, GetRuleQuery } from './generated';

export type Rule = NonNullable<NonNullable<GetRuleQuery['ruleById']>>;

export type Question = NonNullable<
  NonNullable<
    NonNullable<NonNullable<NonNullable<NonNullable<GetRuleQuery['ruleById']>['questions']>['edges']>[number]>['node']
  >
>;

export type Answer = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<GetQuestionsQuery['questions']>['edges']>[number]>['node']
        >['answers']
      >['nodes']
    >
  >
>[number];

export type Score = NonNullable<NonNullable<CalculateScoreQuery['calculateScore']>>;
