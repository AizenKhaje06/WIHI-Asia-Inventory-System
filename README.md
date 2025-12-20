# Inventory Pro - Professional Inventory Management System

A full-stack inventory management system built with Next.js, TypeScript, and Google Sheets integration.

## Features

- **Dashboard** - Real-time inventory overview with low stock alerts
- **Inventory Management** - Add, edit, and delete inventory items
- **Point of Sale** - Process sales with cart functionality
- **Sales Reports** - View COGS, profit margins, and sales analytics
- **Google Sheets Integration** - All data stored in Google Sheets

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Google Sheets API
- **Deployment**: Vercel

## Setup Instructions

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API
4. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Download the JSON credentials file

### 2. Google Sheets Setup

1. Create a new Google Sheets document
2. Create four sheets named exactly:
   - **Inventory** with columns: `ID | Name | Category | Quantity | Total COGS | Cost Price | Selling Price | Reorder Level | Storage Room | Last Updated`
   - **Transactions** with columns: `ID | Item ID | Item Name | Quantity | Cost Price | Selling Price | Total Cost | Profit | Timestamp | Department`
   - **Logs** with columns: `ID | Operation | Item ID | Item Name | Details | Timestamp`
   - **Restock** with columns: `ID | Item ID | Item Name | Quantity Added | Cost Price | Total Cost | Timestamp | Reason`
3. Share the sheet with your Google account (the one you'll use for OAuth)

### 3. OAuth 2.0 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Google Sheets API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URIs: `http://localhost:3000` (for development) and your production URL
7. Download the client configuration JSON

### 4. Get Refresh Token

You'll need to obtain a refresh token. You can use a tool like [google-oauth2-refresh-token](https://github.com/googleapis/google-auth-library-nodejs#oauth2) or create a simple script to get it.

### 5. Environment Variables

Add these to your `.env.local`:

\`\`\`env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
\`\`\`

**Note**: The `GOOGLE_SHEET_ID` is found in your Google Sheets URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables
4. Deploy!

## Usage

- **Dashboard**: View inventory summary and low stock alerts
- **Inventory**: Manage your products with full CRUD operations
- **POS**: Process sales by adding items to cart and checking out
- **Reports**: Filter and view sales analytics with profit calculations
- **Settings**: View setup instructions and sheet structure

## API Endpoints

- `GET /api/items` - Get all inventory items
- `POST /api/items` - Create new item
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item
- `POST /api/sales` - Process sale
- `GET /api/reports` - Get sales report
- `GET /api/dashboard` - Get dashboard stats

## License

MIT
