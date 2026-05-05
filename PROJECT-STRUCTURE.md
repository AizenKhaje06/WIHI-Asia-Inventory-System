# Project Structure

This document describes the organized folder structure of the WIHI Asia Inventory System.

## 📁 Root Directory Structure

```
WIHI-Asia-Inventory-System/
├── app/                    # Next.js app directory (pages, API routes)
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries and helpers
├── public/                 # Static assets (images, icons)
├── styles/                 # Global styles
├── scripts/                # Utility scripts (organized)
│   ├── sql/               # SQL scripts for database operations
│   ├── test/              # Test scripts
│   └── utils/             # Utility command scripts
├── docs/                   # Documentation (organized)
│   ├── guides/            # Setup guides, feature docs, fixes
│   ├── updates/           # Changelog and update notes
│   └── archive/           # Old documentation
├── database-backups/       # Database backup files
├── supabase/              # Supabase migrations and config
├── tests/                 # Test files
├── archive/               # Archived completed features
├── archive-old/           # Old archived files
└── [config files]         # package.json, tsconfig.json, etc.
```

## 📂 Detailed Folder Descriptions

### `/app` - Application Code
- **Purpose**: Next.js 13+ App Router pages and API routes
- **Structure**:
  - `/dashboard` - Admin dashboard pages
  - `/packer` - Packer role pages
  - `/team-leader` - Team leader role pages
  - `/api` - Backend API endpoints

### `/components` - React Components
- **Purpose**: Reusable UI components
- **Structure**:
  - `/ui` - Base UI components (buttons, cards, etc.)
  - `/auth` - Authentication components
  - `/charts` - Chart components
  - `/dashboard` - Dashboard-specific components
  - `/providers` - Context providers
  - `/skeletons` - Loading skeletons

### `/lib` - Libraries & Utilities
- **Purpose**: Helper functions, utilities, and shared logic
- **Key Files**:
  - `auth.ts` - Authentication logic
  - `supabase.ts` - Supabase client
  - `api-client.ts` - API client utilities
  - `financial-utils.ts` - Financial calculations
  - `export-utils.ts` - Export functionality

### `/scripts` - Utility Scripts (ORGANIZED)

#### `/scripts/sql` - SQL Scripts
- Database queries and operations
- Migration helpers
- Data fixes
- Examples:
  - `CHECK_ALL_ACCOUNTS.sql`
  - `CREATE_PACKER_ACCOUNT.sql`
  - `FIX-MISSING-COGS.sql`

#### `/scripts/test` - Test Scripts
- Testing utilities
- Account testing
- API testing
- Examples:
  - `test-all-accounts.js`
  - `test-dashboard-api.js`
  - `hash-packer-password.js`

#### `/scripts/utils` - Utility Commands
- Batch scripts for common tasks
- Build and deployment helpers
- Examples:
  - `CLEANUP-PROJECT.cmd`
  - `COMMIT-AND-PUSH.cmd`
  - `QUICK-COMMIT.cmd`
  - `CHECK-ERRORS.cmd`
  - `TEST-LOGOUT.cmd`

### `/docs` - Documentation (ORGANIZED)

#### `/docs/guides` - Setup & Feature Guides
- Feature implementation guides
- Setup instructions
- Bug fix documentation
- Examples:
  - `SETUP-EMAIL-REPORTS-QUICK-GUIDE.md`
  - `SUPABASE_MIGRATION_GUIDE.md`
  - `LOGOUT-FIX-SUMMARY.md`
  - `AUTOMATED-EMAIL-REPORTS-DONE.md`
  - `DASHBOARD-DAILY-OPERATIONS-COMPLETE.md`

#### `/docs/updates` - Changelog & Updates
- GitHub update logs
- Version history
- Release notes
- Examples:
  - `GITHUB-UPDATE-MARCH-23-2026.md`

#### `/docs/archive` - Old Documentation
- Archived feature docs
- Completed implementation notes
- Historical reference

### `/database-backups` - Database Backups
- Complete database backups
- Migration files
- Backup guides

### `/supabase` - Supabase Configuration
- `/migrations` - Database migration files
- Supabase project configuration

### `/public` - Static Assets
- Images and logos
- Icons
- PDF exports
- HTML utilities (cache clearing)

### `/tests` - Test Files
- Load tests
- Performance tests
- Integration tests

## 🎯 Quick Reference

### Where to Find...

| What You Need | Location |
|---------------|----------|
| SQL queries | `scripts/sql/` |
| Test scripts | `scripts/test/` |
| Utility commands | `scripts/utils/` |
| Setup guides | `docs/guides/` |
| Update logs | `docs/updates/` |
| API routes | `app/api/` |
| UI components | `components/` |
| Helper functions | `lib/` |
| Database migrations | `supabase/migrations/` |
| Static files | `public/` |

## 🔧 Common Tasks

### Run SQL Script
```bash
# Navigate to scripts/sql
cd scripts/sql
# Run with your database client
```

### Run Test Script
```bash
# Navigate to scripts/test
cd scripts/test
node test-all-accounts.js
```

### Run Utility Command
```bash
# Navigate to scripts/utils
cd scripts/utils
# Run any .cmd file
CLEANUP-PROJECT.cmd
```

### Read Documentation
```bash
# Navigate to docs/guides
cd docs/guides
# Open any .md file
```

## 📝 File Naming Conventions

- **SQL Files**: `UPPERCASE-WITH-DASHES.sql`
- **Test Files**: `test-lowercase-with-dashes.js`
- **Docs**: `UPPERCASE-WITH-DASHES.md`
- **Scripts**: `lowercase-with-dashes.ts/js`
- **Components**: `PascalCase.tsx`
- **Utilities**: `kebab-case.ts`

## 🚀 Benefits of This Organization

1. **Easy Navigation** - Files grouped by purpose
2. **Clear Separation** - Scripts, docs, and code are separate
3. **Better Maintenance** - Easy to find and update files
4. **Cleaner Root** - Only essential config files in root
5. **Scalability** - Easy to add new files in proper locations

## 📌 Notes

- Keep root directory clean - only config files
- Archive completed features to `/archive`
- Update this document when adding new folders
- Follow naming conventions for consistency
