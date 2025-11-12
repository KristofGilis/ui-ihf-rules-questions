# Vercel Setup Guide for PR Previews

This guide will help you set up Vercel for automatic PR preview deployments (free tier).

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account (recommended)
3. It's 100% free for personal projects

## Step 2: Create a New Project

1. Click "Add New..." → "Project"
2. Import your `ui-ihf-rules-questions` repository
3. **IMPORTANT**: In the project settings:
   - Framework Preset: **Other**
   - Build Command: Leave empty (we build in GitHub Actions)
   - Output Directory: Leave empty
   - Install Command: Leave empty
4. **Disable** automatic deployments:
   - Go to Project Settings → Git
   - Uncheck "Production Branch" and "Preview Branches"
   - We only want GitHub Actions to deploy, not Vercel's auto-deploy

## Step 3: Get Vercel Credentials

### Get Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions`
4. Scope: Full Account
5. Copy the token (you won't see it again!)

### Get Vercel Org ID

1. Go to your Vercel dashboard
2. Click on your profile/team name in the top left
3. Go to Settings
4. Copy your "Team ID" (or "User ID" if personal account)

### Get Vercel Project ID

1. Go to your project settings
2. Scroll down to "Project ID"
3. Copy the project ID

## Step 4: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret" and add these three secrets:
   - **Name**: `VERCEL_TOKEN`
     - **Value**: [paste your Vercel token]
   - **Name**: `VERCEL_ORG_ID`
     - **Value**: [paste your Team/User ID]
   - **Name**: `VERCEL_PROJECT_ID`
     - **Value**: [paste your Project ID]

## Step 5: Test It!

1. Create a new branch and make a change
2. Open a Pull Request to `main`
3. GitHub Actions will automatically:
   - Build your app
   - Run tests
   - Deploy a preview to Vercel
   - Comment on the PR with the preview URL

## Benefits

✅ **Free** - Unlimited PR previews on free tier
✅ **Fast** - Deploys in seconds on Vercel's global CDN
✅ **Automatic** - Every PR gets its own preview URL
✅ **Isolated** - Each PR has a separate deployment
✅ **Cleanup** - Previews are automatically deleted when PR closes

## Production Deployment

**Note**: Production deployments still go to Azure (as configured). Vercel is only used for PR previews.

## Troubleshooting

### "Vercel project not found"

- Make sure you created the project in Vercel first
- Verify the `VERCEL_PROJECT_ID` is correct

### "Invalid token"

- Generate a new token in Vercel
- Make sure you copied the entire token
- Update the `VERCEL_TOKEN` secret in GitHub

### "Build failed"

- The build happens in GitHub Actions, not Vercel
- Check the GitHub Actions logs for build errors

## Support

For issues, check:

- [Vercel Documentation](https://vercel.com/docs)
- [vercel-action GitHub](https://github.com/amondnet/vercel-action)
