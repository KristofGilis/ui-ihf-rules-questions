export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type rules
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope rules
    'scope-case': [2, 'always', 'lower-case'],
    'scope-enum': [
      2,
      'always',
      [
        // Feature modules (src/app/*)
        'home',
        'quiz',
        'questions',
        'rules',
        'shared',

        // Cross-cutting / infra
        'graphql',
        'i18n',
        'theme',
        'pwa',
        'a11y',

        // Tooling / project-level
        'deps',
        'config',
        'release',
      ],
    ],

    // Subject rules
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // Header rules
    'header-max-length': [2, 'always', 100],

    // Body rules
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],

    // Footer rules
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};
