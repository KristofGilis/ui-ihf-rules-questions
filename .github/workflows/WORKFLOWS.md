# GitHub Actions Workflows

This directory contains scenario-based workflows for different deployment paths.

## Workflow Overview

Three workflows handle all CI/CD scenarios:

1. **release-and-deploy.yml** - Triggered on push to main (handles release, build, test, deploy)
2. **ci-pr-open.yml** - Triggered on PR open (handles build, test, and optional preview)
3. **cleanup-preview.yml** - Triggered on PR close (cleans up Vercel preview)

## Detailed Scenarios

### Scenario 1: Direct Push to Main

**Triggers:** `push` event on `main` branch

**release-and-deploy.yml execution:**

- `release` job → Skipped (no PR context)
- `build-and-test` job → Build and test code
- `deploy` job → Deploy to Azure

**Execution flow:** Push → Build → Deploy (no release)

---

### Scenario 2: PR Open (Any User)

**Triggers:** `pull_request` event on `main` branch

**ci-pr-open.yml execution:**

- `build-and-test` job → Build and test code
- `preview` job → Deploy preview to Vercel (non-renovate only)

**Execution flow:** PR Open → Build → Preview (if not renovate)

---

### Scenario 3: PR Merge (Non-Renovate User)

**Triggers:** `push` event on `main` branch (from PR merge)

**release-and-deploy.yml execution:**

- `release` job → Create GitHub release tag (PR context present, creator is not renovate)
- `build-and-test` job → Build and test code
- `deploy` job → Deploy to Azure

**Execution flow:** PR Merge → Release → Build → Deploy

---

### Scenario 4: PR Merge (Renovate)

**Triggers:** `push` event on `main` branch (from PR merge)

**release-and-deploy.yml execution:**

- `release` job → Skipped (creator is renovate[bot])
- `build-and-test` job → Build and test code
- `deploy` job → Deploy to Azure

**Execution flow:** PR Merge → Build → Deploy (no release)

---

### Scenario 5: PR Close (Non-Renovate User)

**Triggers:** `pull_request` event (closed)

**cleanup-preview.yml execution:**

- Deletes Vercel preview deployment

**Execution flow:** PR Close → Cleanup Preview

---

## Renovate Handling

- **Renovate PRs:** Build only (on open), no preview
- **Renovate PR merge:** Build + deploy, no release
- **Non-renovate PRs:** Build + preview (on open), release + build + deploy (on merge)

## How Release Detection Works

The `release` job in `release-and-deploy.yml` uses the `github.event.pull_requests` context to detect if the push came from a PR merge:

- **Direct push:** `pull_requests` is null → release job skipped
- **PR merge:** `pull_requests` contains PR data → release job runs (unless creator is renovate[bot])

This allows a single workflow to handle all scenarios without conditional skips on commit messages.

## Key Differences from Traditional Single Workflow

- **Separation of concerns:** Build/deploy vs. PR preview are separate workflows
- **Clear triggers:** Easy to understand when each workflow runs
- **Efficient execution:** No unnecessary duplicate builds on PR merges
- **Better debugging:** Easier to identify which stage failed
