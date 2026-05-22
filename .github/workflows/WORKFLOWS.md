# GitHub Actions Workflows

This directory contains three workflows that manage CI/CD, testing, and deployment for the project.

## Workflow Overview

Three workflows handle all CI/CD scenarios:

1. **release-and-deploy.yml** - Triggered on push to main (handles semantic release, build, and deploy to Azure)
2. **ci-pr-open.yml** - Triggered on PR open (handles build, tests, linting)

## Detailed Scenarios

### Scenario 1: Direct Push to Main

**Triggers:** `push` event on `main` branch

**release-and-deploy.yml execution:**

- `release` job → Semantic release (creates release only if commits warrant new version)
- `build` job → Build application (runs regardless of release job outcome with `if: always()`)
- `deploy` job → Deploy to Azure (depends on build)

**Execution flow:** Push → Release (conditional) → Build → Deploy

---

### Scenario 2: PR Open (Any User)

**Triggers:** `pull_request` event on `main` branch

**ci-pr-open.yml execution:**

- `build-and-test` job → Build, lint, test, and check bundle size

**Execution flow:** PR Open → Build/Test

**Details:**

- Runs linting checks
- Builds application in production mode
- Validates bundle size (max 350KB for main bundle)
- Runs unit tests with coverage
- Installs and runs E2E tests with Playwright

---

### Scenario 3: PR Merge (Any User)

**Triggers:** `push` event on `main` branch (from PR merge)

**release-and-deploy.yml execution:**

- `release` job → Semantic release (creates release only if commits warrant new version)
- `build` job → Build application (runs regardless of release job outcome)
- `deploy` job → Deploy to Azure

**Execution flow:** PR Merge → Release (conditional) → Build → Deploy

---

## Notes

- All PRs receive the same CI/CD treatment regardless of actor
- Build job uses `if: always()` to ensure it runs even if release job has no changes to release
- Semantic-release runs on every push but only creates releases when commits warrant a version bump (per conventional commits)
- GitHub token requires `contents: write` and `pull-requests: read` permissions for semantic-release to create releases, tags, and access associated pull request data

## Key Environment Variables

- `NODE_VERSION: 22` - Node.js version used across all workflows
- `AZURE_WEBAPP_NAME: rulequestions` - Azure Web App deployment target
- Build artifacts retained for 1 day

## Secrets Required

- `AZURE_CLIENT_ID` - Azure Service Principal client ID
- `AZURE_TENANT_ID` - Azure Service Principal tenant ID
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
