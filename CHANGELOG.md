## [2.1.3](https://github.com/KristofGilis/ui-ihf-rules-questions/compare/v2.1.2...v2.1.3) (2025-11-24)

### Bug Fixes

- **deps:** update dependency @sentry/angular to ~10.27.0 ([#248](https://github.com/KristofGilis/ui-ihf-rules-questions/issues/248)) ([1bfa9f4](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/1bfa9f415c3d2fa71da0ed3155ed8562152f671f))

## [2.1.2](https://github.com/KristofGilis/ui-ihf-rules-questions/compare/v2.1.1...v2.1.2) (2025-11-19)

### Bug Fixes

- **deps:** update dependency @sentry/angular to ~10.26.0 ([#238](https://github.com/KristofGilis/ui-ihf-rules-questions/issues/238)) ([ae3499a](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/ae3499aacff2dba6a6ecb2a5b4209a61e0868605))

## [2.1.1](https://github.com/KristofGilis/ui-ihf-rules-questions/compare/v2.1.0...v2.1.1) (2025-11-14)

# [2.1.0](https://github.com/KristofGilis/ui-ihf-rules-questions/compare/v2.0.1...v2.1.0) (2025-11-13)

### Features

- pwa updates & deployment improvements ([40a3152](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/40a3152aac73d0199e4fbe081ba1b6c7b7167364))

## [2.0.1](https://github.com/KristofGilis/ui-ihf-rules-questions/compare/v2.0.0...v2.0.1) (2025-11-13)

### Bug Fixes

- Check commit author to skip Renovate releases [skip ci] ([e8a4c7f](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/e8a4c7f7d22302533d03cb779d7d366dec598d6a))
- **deps:** update dependency @sentry/angular to ~10.25.0 ([#211](https://github.com/KristofGilis/ui-ihf-rules-questions/issues/211)) ([51511d3](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/51511d330200ecffbff17bd963387e9ab9166a8c))
- Notch styling to match header background [skip ci] ([26e3a9b](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/26e3a9b2327b2f5db423ddc57063691fff8df23d))
- Skip semantic-release for Renovate bot commits [skip ci] ([6fc0abb](https://github.com/KristofGilis/ui-ihf-rules-questions/commit/6fc0abbd6212204fa82ea66786be4bf81d746b2b))

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
