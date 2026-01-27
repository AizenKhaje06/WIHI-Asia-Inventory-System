# Google Sheets Setup Guide

## Current Issue
The application is running but cannot connect to Google Sheets because the environment variables are not configured.

**Error**: `Missing required parameters: spreadsheetId`

## Quick Fix Steps

### 1. Get Google Sheets Spreadsheet ID

1. Open your Google Sheets document
2. Copy the ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
   ```
3. The ID is the long string between `/d/` and `/edit`

### 2. Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and click "Create"
   - Skip optional steps and click "Done"

5. Create Service Account Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file

### 3. Share Google Sheet with Service Account

1. Open the downloaded JSON file
2. Copy the `client_email` value (looks like: `your-service@project.iam.gserviceaccount.com`)
3. Open your Google Sheets document
4. Click "Share" button
5. Paste the service account email
6. Give it "Editor" permissions
7. Uncheck "Notify people" and click "Share"

### 4. Configure Environment Variables

Open `.env.local` file and update with your credentials:

```env
# Your Spreadsheet ID from Step 1
GOOGLE_SHEETS_SPREADSHEET_ID=1abc123def456ghi789jkl

# From the downloaded JSON file
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Important**: 
- Keep the quotes around `GOOGLE_PRIVATE_KEY`
- Keep the `\n` characters in the private key
- Don't commit `.env.local` to git (it's already in .gitignore)

### 5. Restart Development Server

After configuring `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Alternative: Use Full JSON Credentials

Instead of separate email and private key, you can use the entire JSON file:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

## Verify Setup

Once configured, the dashboard should load without errors and display:
- ✅ Total Revenue
- ✅ Inventory items
- ✅ Sales data
- ✅ Charts and analytics

## Troubleshooting

### Error: "Missing required parameters: spreadsheetId"
- Check that `GOOGLE_SHEETS_SPREADSHEET_ID` is set in `.env.local`
- Verify the spreadsheet ID is correct

### Error: "No permission to access spreadsheet"
- Make sure you shared the spreadsheet with the service account email
- Give "Editor" permissions, not just "Viewer"

### Error: "Invalid credentials"
- Check that the private key is correctly formatted
- Ensure all `\n` characters are preserved
- Keep the quotes around the private key value

### Error: "API not enabled"
- Enable Google Sheets API in Google Cloud Console
- Wait a few minutes for the API to activate

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check the terminal/server logs
3. Verify all environment variables are set correctly
4. Make sure the spreadsheet is shared with the service account

## Security Notes

- ⚠️ Never commit `.env.local` to version control
- ⚠️ Keep your service account credentials secure
- ⚠️ Don't share your private key publicly
- ✅ `.env.local` is already in `.gitignore`
