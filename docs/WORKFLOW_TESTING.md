# CI/CD Workflow Tests

## Overview

This document describes how to test the GitHub Actions workflow behavior, particularly for special cases like Renovate PRs.

## Testing Renovate PR Behavior

### Expected Behavior

When a pull request is created by `renovate[bot]`:

1. ✅ Build job runs (lint, test, E2E, build)
2. ❌ Artifact upload is skipped
3. ❌ Preview deployment is skipped
4. ❌ Preview cleanup is skipped on PR close

### Manual Test Procedure

Since Renovate PR behavior can't be easily E2E tested, use this manual verification:

#### 1. Test with Regular PR

```bash
# Create feature branch
git checkout -b test/workflow-verification
echo "test" >> README.md
git add README.md
git commit -m "test: verify workflow"
git push origin test/workflow-verification
```

**Expected in GitHub Actions**:

- ✅ Build job runs
- ✅ Artifact uploaded
- ✅ Preview job runs
- ✅ Preview comment posted
- ✅ Cleanup job runs on PR close

#### 2. Simulate Renovate PR (Manual Verification)

Unfortunately, you can't easily simulate a Renovate PR without actually having Renovate create one. Instead:

**Option A: Wait for Real Renovate PR**

1. Wait for Renovate to create a dependency update PR
2. Verify build job runs
3. Verify preview job is skipped
4. Check Actions logs for: `Skipping preview: github.actor = renovate[bot]`

**Option B: Temporarily Modify Workflow**

```yaml
# Temporarily change condition to test
preview:
  if: github.event_name == 'pull_request' && github.actor != 'your-username'
```

Then create a PR and verify it's skipped.

### Workflow Conditions to Verify

#### Artifact Upload Condition

```yaml
if: github.ref == 'refs/heads/main' || (github.event_name == 'pull_request' && github.actor != 'renovate[bot]')
```

**Test Matrix**:
| Scenario | Branch | Actor | Artifact Upload? |
|----------|--------|-------|------------------|
| Main push | main | any | ✅ Yes |
| Feature PR | feat/_ | human | ✅ Yes |
| Renovate PR | renovate/_ | renovate[bot] | ❌ No |

#### Preview Deployment Condition

```yaml
if: github.event_name == 'pull_request' && github.actor != 'renovate[bot]'
```

**Test Matrix**:
| Scenario | Event | Actor | Preview Deploy? |
|----------|-------|-------|-----------------|
| PR opened | pull_request | human | ✅ Yes |
| PR sync | pull_request | human | ✅ Yes |
| Renovate PR | pull_request | renovate[bot] | ❌ No |
| Main push | push | any | ❌ No |

#### Cleanup Condition

```yaml
if: github.event_name == 'pull_request' && github.event.action == 'closed' && github.actor != 'renovate[bot]'
```

**Test Matrix**:
| Scenario | Event | Action | Actor | Cleanup? |
|----------|-------|--------|-------|----------|
| PR closed | pull_request | closed | human | ✅ Yes |
| PR merged | pull_request | closed | human | ✅ Yes |
| Renovate closed | pull_request | closed | renovate[bot] | ❌ No |

## Automated Workflow Tests (Future Enhancement)

To properly test workflow behavior, consider:

### Option 1: GitHub Actions Test Workflow

Create a separate test workflow that mocks different scenarios:

```yaml
# .github/workflows/test-workflow-logic.yml
name: Test Workflow Logic

on:
  workflow_dispatch:
    inputs:
      actor:
        description: 'Simulate actor (e.g., renovate[bot])'
        required: true
        default: 'human-user'
      event:
        description: 'Event type'
        required: true
        default: 'pull_request'

jobs:
  test-conditions:
    runs-on: ubuntu-latest
    steps:
      - name: Test artifact upload condition
        if: github.ref == 'refs/heads/main' || (github.event_name == 'pull_request' && github.event.inputs.actor != 'renovate[bot]')
        run: echo "Artifact would be uploaded"

      - name: Test preview condition
        if: github.event.inputs.event == 'pull_request' && github.event.inputs.actor != 'renovate[bot]'
        run: echo "Preview would be deployed"
```

### Option 2: GitHub API Integration Tests

Use GitHub API to create test PRs and verify workflow behavior:

```typescript
// test-workflow.spec.ts (not implemented yet)
describe('GitHub Workflow', () => {
  it('should skip preview for renovate PRs', async () => {
    // Create PR via API with renovate[bot] author
    // Trigger workflow
    // Verify preview job was skipped
  });
});
```

### Option 3: Workflow Linting

Use tools like `actionlint` to validate workflow syntax:

```bash
# Install
brew install actionlint

# Run
actionlint .github/workflows/github-actions.yml
```

## Monitoring Workflow Behavior

### GitHub Actions Logs

Check workflow runs for:

- Which jobs ran
- Which jobs were skipped
- Condition evaluation logs

### Metrics to Track

1. **Renovate PR Count**: How many dependency PRs per month
2. **Preview Cost Savings**: Estimated Vercel deployment cost saved
3. **Workflow Run Time**: Average duration for different PR types
4. **Artifact Size**: Trend over time

### Example Log Verification

**Feature PR** (should deploy preview):

```
✅ Build job: Success
✅ Upload artifact: Success
✅ Preview job: Success
✅ Comment with URL: Success
```

**Renovate PR** (should skip preview):

```
✅ Build job: Success
⏭️ Upload artifact: Skipped (actor is renovate[bot])
⏭️ Preview job: Skipped (actor is renovate[bot])
```

## Troubleshooting

### Issue: Preview Deploys for Renovate

**Symptoms**: Renovate PRs trigger preview deployments

**Diagnosis**:

```bash
# Check workflow file
grep "renovate\[bot\]" .github/workflows/github-actions.yml
```

**Solution**: Verify condition syntax is exact:

```yaml
github.actor != 'renovate[bot]'  # ✅ Correct (with quotes)
github.actor != renovate[bot]    # ❌ Wrong (no quotes)
```

### Issue: Regular PRs Don't Deploy

**Symptoms**: Human-created PRs skip preview

**Diagnosis**: Check GitHub Actions logs for condition evaluation

**Solution**: Verify parentheses in complex conditions:

```yaml
# ✅ Correct
if: github.event_name == 'pull_request' && github.actor != 'renovate[bot]'

# ❌ Wrong
if: github.event_name == 'pull_request' || github.actor != 'renovate[bot]'
```

## Verification Checklist

Before merging workflow changes:

- [ ] Tested with regular PR from feature branch
- [ ] Verified artifact uploads correctly
- [ ] Verified preview deploys and URL is commented
- [ ] Verified cleanup runs when PR is closed
- [ ] Checked workflow logs for skipped jobs
- [ ] Confirmed main branch deployment still works
- [ ] Monitored first Renovate PR after changes
- [ ] Verified bundle size check runs
- [ ] Confirmed E2E tests run in CI
- [ ] Validated workflow syntax with `actionlint`

## Resources

- [GitHub Actions Conditional Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idif)
- [GitHub Actions Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [Testing GitHub Actions](https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration)
- [actionlint](https://github.com/rhysd/actionlint)

---

**Last Updated**: November 9, 2025  
**Next Review**: When workflow is modified
