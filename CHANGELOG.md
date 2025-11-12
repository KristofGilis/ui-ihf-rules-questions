# [2.0.0](https://github.com/KristofGilis/ui-ihf-rules-questions/compare/v1.0.0...v2.0.0) (2025-11-12)

- feat!: Complete UI redesign with Tailwind CSS 4 and production deployment ([0bbb239](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/0bbb239b228a7db5a5a8ea62ec9dcdebd6858c01))

### BREAKING CHANGES

- Complete application redesign with modern tech stack

Major Changes:

- Migrated from Angular Material to Tailwind CSS 4
- Complete UI/UX redesign with modern gradient aesthetics
- Implemented semantic-release for automated versioning
- Added comprehensive E2E test suite (116 tests, 100% passing)
- Configured Azure deployment with OIDC authentication
- Added Vercel preview deployments for PRs
- Implemented PWA features with service worker
- Added comprehensive error handling and accessibility
- Configured Sentry for error tracking
- Added code quality tools (Prettier, ESLint, Husky, CommitLint)

Technical Improvements:

- Upgraded to Angular 20.3
- Implemented signal-based state management
- Added Apollo Client with GraphQL code generation
- Configured bundle size monitoring (350KB limit)
- Added scroll restoration and route guards
- Implemented toast notifications and loading states
- Added infinite scroll for large lists
- Configured CSP headers and security best practices

Testing:

- 116 E2E tests with Playwright
- 645 unit tests with Jest
- Accessibility testing with axe-core
- Coverage reporting configured

Documentation:

- ADRs for architectural decisions
- Deployment guides for Azure and Vercel
- Workflow testing documentation
- Contributing guidelines
