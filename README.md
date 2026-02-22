# Inventory Pro - Professional Inventory Management System

A full-stack inventory management system built with Next.js, TypeScript, and Supabase.

## Features

- **Dashboard** - Real-time inventory overview with low stock alerts
- **Inventory Management** - Add, edit, and delete inventory items
- **Point of Sale** - Process sales with cart functionality
- **Sales Reports** - View COGS, profit margins, and sales analytics
- **Transaction Cancellation** - Cancel transactions with automatic inventory restoration
- **Supabase Database** - All data stored in Supabase PostgreSQL database

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project
3. Run the database migrations from the `supabase/migrations` folder in your Supabase SQL Editor
4. Get your project credentials from Settings > API

### 3. Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

**Note**: Get your Supabase credentials from: https://app.supabase.com/project/_/settings/api

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
