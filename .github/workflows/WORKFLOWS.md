# GitHub Actions Workflows - Documentation

## Overview

The CI/CD pipeline has been split into 4 separate, focused workflows to improve clarity and prevent duplicate runs.

## Workflows

### 1. `release.yml` - Semantic Release

**Triggers:** `pull_request_target` (when PR is merged to main)

**Behavior:**

- Only runs when a PR is successfully merged (squash, rebase, or merge commit)
- Skips if the commit author is `renovate[bot]`
- Creates semantic version tags and releases
- Does NOT run on direct commits to main

**Execution Time:** ~1-2 minutes

---

### 2. `build-and-test.yml` - Build and Test

**Triggers:**

1. `pull_request` (on pull request open, synchronize, reopen)
2. `push` (on direct commits to main)
3. `workflow_run` (after `release.yml` completes successfully on PR merge)

**Behavior:**

- Lints code
- Builds production bundle
- Checks bundle size (max 350KB)
- Runs unit tests with coverage
- Runs E2E tests with Playwright
- Uploads artifacts for deployment

**Execution Time:** ~5-10 minutes

---

### 3. `preview.yml` - Vercel Preview Deployments

**Triggers:** `pull_request` (all events on PRs to main)

**Behavior:**

- Deploys preview on PR open/update
- Comments PR with preview URL
- Cleans up preview on PR close
- Skips for Renovate bot

**Execution Time:** ~2-3 minutes

---

### 4. `deploy.yml` - Azure Deployment

**Triggers:** `workflow_run` (after `build-and-test.yml` completes successfully)

**Behavior:**

- Only runs after successful build-and-test
- Downloads build artifacts
- Deploys to Azure Web App with PM2

**Execution Time:** ~2-3 minutes

---

## Execution Flows

### Flow 1: PR Merge to main (with Release)

```
PR Merged
    ↓
release.yml (creates version tag)
    ↓ (success)
build-and-test.yml (build + test + artifacts)
    ↓ (success)
deploy.yml (deploy to Azure)
```

### Flow 2: Direct Commit to main (no Release)

```
Direct Commit
    ↓
build-and-test.yml (build + test + artifacts)
    ↓ (success)
deploy.yml (deploy to Azure)
```

### Flow 3: Pull Request (Preview Only)

```
PR Opened/Updated
    ↓
build-and-test.yml (build + test)
    ↓
preview.yml (Vercel preview)
```

---

## Key Features

✅ **Release only on PR merges** - Direct commits skip semantic-release
✅ **Sequential execution** - Build waits for release, deploy waits for build
✅ **No duplicate runs** - Each commit triggers only relevant workflows
✅ **Preview deployments** - Automatic previews for PRs
✅ **Artifact reuse** - Build artifacts shared across workflows
✅ **Renovate skip** - Bot commits don't trigger releases or previews

---

## Notes

- The original `github-actions.yml` is backed up as `github-actions.yml.bak`
- Artifacts are automatically cleaned up after retention period (default: 90 days)
- Preview deployments are deleted when PRs are closed
