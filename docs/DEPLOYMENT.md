# Deployment Guide

This guide covers all deployment scenarios for the IHF Rules Quiz application.

## Table of Contents

- [Overview](#overview)
- [Deployment Environments](#deployment-environments)
- [Prerequisites](#prerequisites)
- [Production Deployment (Azure)](#production-deployment-azure)
- [Preview Deployments (Vercel)](#preview-deployments-vercel)
- [Manual Deployment](#manual-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

The application uses a two-tier deployment strategy:

- **Production**: Azure Static Web Apps (main branch)
- **Preview**: Vercel (pull requests, except Renovate)

This approach optimizes costs while providing preview environments for code review.

### Deployment Flow

```
┌─────────────────┐
│  Pull Request   │
│  (feat/*)       │
└────────┬────────┘
         │
         ├─► Build & Test (GitHub Actions)
         │
         ├─► Deploy Preview (Vercel)
         │   └─► Comment PR with preview URL
         │
         └─► Merge to main
                  │
                  ├─► Build & Test (GitHub Actions)
                  │
                  └─► Deploy Production (Azure)
```

---

## Deployment Environments

### Production (Azure)

- **URL**: https://rulequestions.azurewebsites.net
- **Platform**: Azure Web App (Linux)
- **Runtime**: PM2 serving static files
- **CDN**: Azure CDN (optional)
- **SSL**: Azure-managed certificate
- **Deployment**: Automatic on `main` branch push

### Preview (Vercel)

- **URL**: `https://<project>-<hash>-<team>.vercel.app`
- **Platform**: Vercel Free Tier
- **Deployment**: Automatic on PR open/sync
- **Lifecycle**: Auto-deleted when PR is closed
- **Restrictions**: Skipped for Renovate PRs

---

## Prerequisites

### Azure Production

You need the following secrets in GitHub repository settings:

| Secret                  | Description                | How to get                            |
| ----------------------- | -------------------------- | ------------------------------------- |
| `AZURE_CLIENT_ID`       | Managed Identity Client ID | Azure Portal → App Registration       |
| `AZURE_TENANT_ID`       | Azure Tenant ID            | Azure Portal → Azure Active Directory |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID      | Azure Portal → Subscriptions          |

#### Setting up Azure OIDC

1. **Create Azure App Registration**:

   ```bash
   az ad app create --display-name "github-actions-rulequestions"
   ```

2. **Create Service Principal**:

   ```bash
   az ad sp create --id <APP_ID>
   ```

3. **Add Federated Credential**:

   ```bash
   az ad app federated-credential create \
     --id <APP_ID> \
     --parameters @- <<EOF
   {
     "name": "github-actions-main",
     "issuer": "https://token.actions.githubusercontent.com",
     "subject": "repo:KristofGilis/ui-ihf-rules-questions:ref:refs/heads/main",
     "audiences": ["api://AzureADTokenExchange"]
   }
   EOF
   ```

4. **Assign Role**:
   ```bash
   az role assignment create \
     --assignee <APP_ID> \
     --role "Website Contributor" \
     --scope "/subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RG>/providers/Microsoft.Web/sites/rulequestions"
   ```

### Vercel Preview

You need the following secrets in GitHub repository settings:

| Secret              | Description            | How to get                               |
| ------------------- | ---------------------- | ---------------------------------------- |
| `VERCEL_TOKEN`      | Vercel API Token       | See [VERCEL_SETUP.md](./VERCEL_SETUP.md) |
| `VERCEL_ORG_ID`     | Vercel Organization ID | See [VERCEL_SETUP.md](./VERCEL_SETUP.md) |
| `VERCEL_PROJECT_ID` | Vercel Project ID      | See [VERCEL_SETUP.md](./VERCEL_SETUP.md) |

Detailed Vercel setup instructions: [docs/VERCEL_SETUP.md](./VERCEL_SETUP.md)

---

## Production Deployment (Azure)

### Automatic Deployment

Production deployments happen automatically when code is merged to `main`:

1. **Trigger**: Push to `main` branch
2. **Build**: GitHub Actions builds production bundle
3. **Test**: Runs all unit and E2E tests
4. **Bundle Check**: Validates bundle size < 350KB
5. **Deploy**: Deploys to Azure Web App via Azure CLI

### Deployment Steps (GitHub Actions)

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Download build artifact
    - name: Azure Login (OIDC)
    - name: Deploy to Azure Web App
      with:
        app-name: rulequestions
        package: ./dist/ui-ihf-rules-questions/browser
        clean: true
        startup-command: pm2 serve /home/site/wwwroot --no-daemon --spa
```

### Azure Web App Configuration

**Runtime Stack**: Node.js 20 LTS

**Startup Command**:

```bash
pm2 serve /home/site/wwwroot --no-daemon --spa
```

This serves the Angular app as a Single Page Application with proper routing.

**Environment Variables**:

- None required (API URL is in compiled bundle)

**Application Settings**:

- `WEBSITE_NODE_DEFAULT_VERSION`: `~20`
- `SCM_DO_BUILD_DURING_DEPLOYMENT`: `false` (we deploy pre-built)

### Verifying Production Deployment

1. **Check GitHub Actions**:
   - Go to Actions tab
   - Verify "Build and Deploy UI" workflow succeeded
   - Check "deploy" job logs

2. **Check Azure Portal**:
   - Navigate to App Service
   - Check "Deployment Center" for latest deployment
   - Review "Log stream" for startup logs

3. **Verify Application**:

   ```bash
   curl -I https://rulequestions.azurewebsites.net
   # Should return 200 OK
   ```

4. **Test Critical Paths**:
   - Home page loads
   - Quiz can be started
   - Questions browser works
   - Service Worker installs

---

## Preview Deployments (Vercel)

### Automatic Preview Deployment

Preview deployments happen for every PR (except Renovate):

1. **Trigger**: PR opened/synchronized
2. **Build**: GitHub Actions builds production bundle
3. **Upload**: Artifact uploaded
4. **Deploy**: Vercel deploys preview
5. **Comment**: Bot comments with preview URL

### Preview URL Format

```
https://ui-ihf-rules-questions-<git-hash>-<team-name>.vercel.app
```

### Preview Lifecycle

- **Created**: When PR is opened or updated
- **Updated**: On every push to PR branch
- **Deleted**: Automatically when PR is closed/merged

### Skipping Preview for Renovate

Renovate PRs skip preview deployments to save costs:

```yaml
preview:
  if: github.event_name == 'pull_request' && github.actor != 'renovate[bot]'
```

### Manual Preview Deployment

If you need to manually deploy a preview:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd dist/ui-ihf-rules-questions/browser
vercel --prod
```

### Verifying Preview Deployment

1. **Check PR Comment**: Look for bot comment with preview URL
2. **Click Preview URL**: Verify app loads
3. **Test Feature**: Verify your PR changes work

---

## Manual Deployment

### Build Locally

```bash
# Install dependencies
npm ci

# Run tests
npm test
npm run test:e2e

# Build production bundle
npm run build -- --configuration=production

# Verify bundle size
du -sh dist/ui-ihf-rules-questions/browser
```

### Deploy to Azure Manually

```bash
# Login to Azure
az login

# Deploy
az webapp deployment source config-zip \
  --resource-group rulequestions-rg \
  --name rulequestions \
  --src dist.zip
```

### Deploy to Vercel Manually

```bash
# Build
npm run build:web

# Deploy
cd dist/ui-ihf-rules-questions/browser
vercel --prod
```

---

## Rollback Procedures

### Azure Rollback

Azure keeps deployment history. To rollback:

#### Option 1: Via Azure Portal

1. Go to Azure Portal → App Service → Deployment Center
2. Find previous successful deployment
3. Click "Redeploy"

#### Option 2: Via Git

```bash
# Revert the problematic commit
git revert <commit-hash>
git push origin main
# Automatic deployment will trigger
```

#### Option 3: Emergency (Manual)

```bash
# Deploy a specific tag/commit
git checkout <good-commit-or-tag>
npm ci
npm run build:web

# Create zip
cd dist/ui-ihf-rules-questions/browser
zip -r ../../../dist.zip .

# Deploy
az webapp deployment source config-zip \
  --resource-group rulequestions-rg \
  --name rulequestions \
  --src dist.zip
```

### Vercel Rollback

Vercel automatically keeps all deployments:

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments"
4. Find previous working deployment
5. Click "Promote to Production"

---

## Monitoring

### Application Health

**Azure Application Insights** (if enabled):

- Monitor response times
- Track error rates
- View user analytics

**Sentry** (enabled in production):

- Real-time error tracking
- User session replays
- Performance monitoring

### Deployment Status

**GitHub Actions**:

- Build status badges
- Email notifications on failure
- Slack integration (optional)

### Bundle Size Monitoring

Every deployment checks bundle size:

```bash
MAIN_SIZE=$(find dist/ui-ihf-rules-questions/browser -name 'main*.js' -exec wc -c {} \;)
MAX_SIZE=350000
if [ $MAIN_SIZE -gt $MAX_SIZE ]; then
  echo "❌ Bundle size exceeds limit!"
  exit 1
fi
```

Current limit: **350KB** (main bundle)

---

## Troubleshooting

### Common Issues

#### 1. Deployment Fails: "Artifact not found"

**Problem**: Preview job can't find build artifact

**Solution**: Check if build job succeeded and artifact was uploaded

```yaml
# Ensure this step succeeded in build job
- name: Upload artifact
  if: github.ref == 'refs/heads/main' || (github.event_name == 'pull_request' && github.actor != 'renovate[bot]')
```

#### 2. Azure: "Application Error"

**Problem**: App crashes on startup

**Solution**: Check logs

```bash
# Stream logs
az webapp log tail --name rulequestions --resource-group rulequestions-rg

# Check startup command
az webapp config show --name rulequestions --resource-group rulequestions-rg --query "siteConfig.appCommandLine"
```

#### 3. Vercel: "404 on Refresh"

**Problem**: SPA routing not configured

**Solution**: Verify `vercel.json` has rewrites:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### 4. Bundle Size Exceeds Limit

**Problem**: Main bundle > 350KB

**Solution**:

1. Check what changed: `npm run bundle:analyze`
2. Review dependencies: `npm ls --depth=0`
3. Enable lazy loading for new features
4. Consider increasing limit if justified

#### 5. Service Worker Not Updating

**Problem**: Users see old version

**Solution**:

1. Verify `ngsw-config.json` is correct
2. Check Cache-Control headers
3. Force refresh: Ctrl+Shift+R
4. Clear service worker: DevTools → Application → Service Workers → Unregister

#### 6. GraphQL Errors in Production

**Problem**: API calls failing

**Solution**:

1. Verify API endpoint in `environment.prod.ts`
2. Check CORS settings on API
3. Verify CSP allows API domain
4. Check network logs in DevTools

### Getting Help

- **GitHub Issues**: Report bugs or deployment issues
- **Sentry**: Check error logs (link in Sentry dashboard)
- **Azure Support**: For infrastructure issues

---

## Security Considerations

### Secrets Management

- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate tokens regularly (every 90 days)
- ✅ Use OIDC for Azure (no long-lived credentials)

### Content Security Policy

The app uses strict CSP headers:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' https://*.sentry.io; 
               connect-src 'self' https://api-ihf-rules-questions.azurewebsites.net..." />
```

Verify CSP allows all necessary domains before deploying.

### HTTPS

- ✅ Azure: Automatic HTTPS with managed certificate
- ✅ Vercel: Automatic HTTPS for all deployments
- ✅ Redirect HTTP → HTTPS (configured in both platforms)

---

## Performance Optimization

### Caching Strategy

**Service Worker**:

- App shell: Prefetch
- Assets: Lazy load
- Translations: Cache on demand

**CDN Headers** (Vercel):

```json
{
  "headers": [
    {
      "source": "/(.*).js",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

### Bundle Optimization

Current optimizations:

- ✅ AOT compilation
- ✅ Tree shaking
- ✅ Minification
- ✅ Font optimization
- ✅ Code splitting (lazy routes)

### CDN Configuration (Optional)

To add Azure CDN:

1. Create CDN profile
2. Add CDN endpoint pointing to Web App
3. Configure caching rules
4. Update DNS (if using custom domain)

---

## Maintenance

### Regular Tasks

**Weekly**:

- Review Sentry errors
- Check bundle size trend
- Review failed deployments

**Monthly**:

- Update dependencies (via Renovate)
- Review Azure costs
- Audit security headers

**Quarterly**:

- Rotate API tokens
- Review deployment procedures
- Update documentation

---

## Additional Resources

- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Setup Guide](./VERCEL_SETUP.md)
- [Architecture Decision Records](./ADR/)

---

**Last Updated**: November 9, 2025  
**Maintained by**: Development Team
