# GitHub Actions Workflows

This directory contains scenario-based workflows for different deployment paths.

## Workflow Structure

### Scenario 1: Direct Push to Main

**Triggers:** `push` event on `main` branch

**ci-push-main.yml**

- `build-and-test` job → Build and test code
- `deploy` job → Deploy to Azure (after build succeeds)

**Execution flow:** Push → Build → Deploy

---

### Scenario 2: PR Open (Any User)

**Triggers:** `pull_request` event on `main` branch

1. **ci-pr-open.yml**
   - `build-and-test` job → Build and test code
   - `preview` job → Deploy preview to Vercel (non-renovate only)

**Execution flow:** PR Open → Build → Preview (if not renovate)

---

### Scenario 3: PR Merge (Non-Renovate User)

**Triggers:** `pull_request_target` event (closed + merged)

1. **release-and-deploy.yml**
   - `release` job → Create GitHub release tag
   - `build-and-test` job → Build and test code (after release)
   - `deploy` job → Deploy to Azure (after build)

**Execution flow:** PR Merge → Release → Build → Deploy

---

### Scenario 4: PR Merge (Renovate)

**Triggers:** `pull_request_target` event (closed + merged)
**Condition:** Renovate bot PR merge

1. **release-and-deploy.yml**
   - `release` job → Skipped (renovate condition filters it out)
   - `build-and-test` job → Build and test code
   - `deploy` job → Deploy to Azure

**Execution flow:** PR Merge → Build → Deploy (no release)

---

### Scenario 5: PR Close (Non-Renovate User)

**Triggers:** `pull_request` event (closed)

1. **cleanup-preview.yml** → Delete Vercel preview deployment

**Execution flow:** PR Close → Cleanup Preview

---

## Renovate Handling

- Renovate PRs: Build only (on open), no preview
- Renovate PR merge: Build + deploy, no release
- Non-renovate PRs: Build + preview (on open), release + build + deploy (on merge)

## Key Differences from Traditional Single Workflow

- **Separation of concerns:** Each workflow has a single responsibility
- **Clear triggers:** Easy to understand when each workflow runs
- **Independent scaling:** Can run builds separately from deployments
- **Better debugging:** Easier to identify which stage failed
