# Cloudflare Pages Deployment Setup

This guide explains how to set up Cloudflare Pages deployment for the CardStrike project using GitHub Actions.

## Prerequisites

1. A Cloudflare account
2. An existing Cloudflare Pages project named `cardstrike`
3. GitHub repository access with permission to add secrets

## Setting Up Cloudflare API Tokens

1. Log in to your Cloudflare dashboard
2. Navigate to "My Profile" > "API Tokens"
3. Click "Create Token"
4. Select "Edit Cloudflare Workers" template
5. Customize the token to include:
   - Zone Resources: Include specific zone (your domain)
   - Account Resources: Include specific account
   - Permissions:
     - Account > Cloudflare Pages: Edit
     - Account > Workers Scripts: Edit
6. Generate the token and copy it

## Required GitHub Secrets

Add the following secrets to your GitHub repository:

1. `CLOUDFLARE_API_TOKEN`: The API token created above
2. `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (found in the dashboard URL)
3. Application environment variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_HTTP_REFERER`
   - `OPENROUTER_MODEL_NAME` (optional)
   - `OPENROUTER_API_URL` (optional)
   - `OPENROUTER_DEFAULT_SYSTEM_MESSAGE` (optional)

## Workflow Overview

The `master.yml` workflow runs when code is pushed to the `master` branch:

1. Lints the code
2. Runs unit tests
3. Builds the application for production
4. Deploys the built application to Cloudflare Pages
5. Sends a notification about the deployment status

## Customizing the Deployment

To customize the deployment, you can modify:

- `wrangler.toml`: Configuration for Cloudflare Workers
- `.cloudflare/worker.js`: Entry point for the Cloudflare Worker
- `.github/workflows/master.yml`: GitHub Actions workflow for deployment

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for detailed error messages
2. Verify your Cloudflare API token has the necessary permissions
3. Ensure the Cloudflare Pages project exists and is correctly named
4. Submit an issue using the GitHub Action issue template
