# 📦 Database Backups - WIHI Asia Inventory System

Complete database backup and migration files for Supabase.

## 📁 Folder Contents

### Main Files
- **`COMPLETE_DATABASE_BACKUP.sql`** - Complete SQL to create all tables from scratch
- **`DATABASE_BACKUP_GUIDE.md`** - Detailed guide on how to use the backup
- **`FEB_16_SALES_VERIFICATION.md`** - Sales data verification report

### Migration Files (`migrations/`)
All individual migration files in chronological order:

1. **`001_enable_rls.sql`** - Enable Row Level Security on all tables
2. **`002_create_policies_SIMPLE.sql`** - Create security policies (simplified version) ⭐ USE THIS
3. **`002_create_policies.sql`** - Alternative policies (more complex)
4. **`003_create_customers_table.sql`** - Create customers table
5. **`004_fix_log_operations.sql`** - Fix log operations (empty/placeholder)
6. **`005_add_staff_name_to_logs.sql`** - Add staff_name column to logs
7. **`006_backfill_total_revenue.sql`** - Populate total_revenue for existing transactions

## 🚀 Quick Start

### Option 1: Complete Fresh Setup (Recommended)
Use this if you're creating a brand new database:

```sql
-- Run this single file in Supabase SQL Editor:
COMPLETE_DATABASE_BACKUP.sql
```

This creates ALL tables, indexes, RLS policies, and security settings in one go!

### Option 2: Step-by-Step Migration
Use this if you want to run migrations one by one:

```sql
-- Run in order:
1. migrations/001_enable_rls.sql
2. migrations/002_create_policies_SIMPLE.sql
3. migrations/003_create_customers_table.sql
4. migrations/005_add_staff_name_to_logs.sql
5. migrations/006_backfill_total_revenue.sql
```

## 📋 What Gets Created

### 8 Tables:
1. ✅ **inventory** - Products and stock levels
2. ✅ **transactions** - Sales and movements (with total_revenue column)
3. ✅ **customers** - Customer data with loyalty tiers
4. ✅ **logs** - Activity logs (with staff_name column)
5. ✅ **restocks** - Restock history
6. ✅ **storage_rooms** - Storage locations
7. ✅ **categories** - Product categories
8. ✅ **users** - System authentication

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies configured for service_role access
- ✅ Read access for authenticated users

### Performance:
- ✅ 20+ indexes for fast queries
- ✅ Optimized for reporting and analytics

## ⚠️ Important Notes

1. **Before running**: Backup your current data if you have any
2. **Service Role Key**: Make sure you're using the service_role key, not anon key
3. **Environment**: Update your `.env.local` after creating new database
4. **Verification**: Run verification queries after setup (see guide)

## 🔄 Restore Process

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy content from `COMPLETE_DATABASE_BACKUP.sql`
4. Paste and run
5. Verify tables created
6. Done! ✅

## 📖 Detailed Documentation

See **`DATABASE_BACKUP_GUIDE.md`** for:
- Complete step-by-step instructions
- Verification queries
- Table relationships
- Troubleshooting tips
- Backup schedule recommendations

## 🗓️ Last Updated

**Date**: February 18, 2026  
**Version**: 1.0  
**Total Files**: 10  
**Database Tables**: 8  

## 📞 Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify RLS policies are correct
3. Ensure service_role key is configured
4. Review `DATABASE_BACKUP_GUIDE.md` for troubleshooting

---

**Note**: Keep this folder safe! It contains everything needed to recreate your database structure.
