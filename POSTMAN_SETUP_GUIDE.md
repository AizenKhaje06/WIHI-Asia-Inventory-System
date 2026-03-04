# Postman Power Setup Guide

## Overview
The Postman power enables automated API testing and collection management directly from Kiro. This guide will help you complete the setup.

## What's Been Configured

✅ **MCP Configuration**: Created `.kiro/settings/mcp.json` with Postman server connection
✅ **Automation Hook**: Created `.kiro/hooks/api-postman-testing.kiro.hook` to auto-test on API changes
✅ **Storage File**: Created `.postman.json` to store workspace and collection IDs

## Step 1: Get Your Postman API Key

1. Go to [postman.com](https://postman.com) and log in
2. Navigate to **Settings → API Keys**
3. Click **Generate API Key**
4. Give it a name like "Kiro Integration"
5. Ensure it has these permissions:
   - Workspace management
   - Collection read/write
   - Environment read/write
   - Collection runs
6. Copy the generated API key

## Step 2: Set Your API Key

You have two options:

### Option A: Environment Variable (Recommended)
Set the `POSTMAN_API_KEY` environment variable on your system:

**Windows (PowerShell)**:
```powershell
[System.Environment]::SetEnvironmentVariable('POSTMAN_API_KEY', 'your-api-key-here', 'User')
```

**Windows (CMD)**:
```cmd
setx POSTMAN_API_KEY "your-api-key-here"
```

Then restart Kiro for the change to take effect.

### Option B: Hardcode in Config
Edit `.kiro/settings/mcp.json` and replace `${POSTMAN_API_KEY}` with your actual key:

```json
{
  "mcpServers": {
    "postman": {
      "url": "https://mcp.postman.com/minimal",
      "headers": {
        "Authorization": "Bearer your-actual-api-key-here"
      }
    }
  }
}
```

## Step 3: Restart Kiro

After setting your API key, restart Kiro to load the Postman power with your credentials.

## Step 4: Verify Setup

Once restarted, ask Kiro to:
1. List your Postman workspaces
2. Create a test collection
3. Run a simple API test

## What the Automation Does

The hook monitors these files for changes:
- `app/api/**/*.ts` - All API route files
- `app/api/**/*.js` - JavaScript API files
- `lib/**/*.ts` - Library/utility files
- `middleware.ts` - Middleware configuration
- `next.config.mjs` - Next.js config
- `.env.example` - Environment variables

When you save changes to any of these files, Kiro will automatically:
1. Check if `.postman.json` has collection info
2. If not, offer to create a Postman collection for your API
3. If yes, run the collection tests
4. Show you the results and suggest fixes for any failures

## Your API Endpoints

Based on your project structure, you have these API routes:
- `/api/accounts`
- `/api/analytics`
- `/api/categories`
- `/api/customers`
- `/api/dashboard`
- `/api/departments`
- `/api/health`
- `/api/internal-usage`
- `/api/items`
- `/api/logs`
- `/api/orders`
- `/api/reports`
- `/api/restocks`
- `/api/sales`
- `/api/stores`
- `/api/sync-orders`
- `/api/test-status`
- `/api/test-supabase`

## Next Steps

1. **Set your API key** (see Step 2 above)
2. **Restart Kiro**
3. **Create your first collection**: Ask Kiro to "Create a Postman collection for my inventory API"
4. **Test it**: Make a change to any API file and watch the automation run

## Useful Commands

Once setup is complete, you can ask Kiro:
- "List my Postman workspaces"
- "Create a collection for the orders API"
- "Run my API tests"
- "Show me the test results"
- "Create an environment for local testing"

## Troubleshooting

**"No tools available"**: Your API key isn't set or Kiro hasn't been restarted
**"Collection not found"**: Check `.postman.json` has the correct collection ID
**"Unauthorized"**: Your API key may be invalid or expired
**Tests fail**: Ensure your dev server is running (`npm run dev`)

## Configuration Files

- **`.kiro/settings/mcp.json`**: Postman server connection config
- **`.kiro/hooks/api-postman-testing.kiro.hook`**: Automation hook
- **`.postman.json`**: Stores workspace/collection/environment IDs

---

**Status**: ⏳ Waiting for API key configuration
**Next**: Set your Postman API key and restart Kiro
