# Shared Pages Refactor - In Progress

## Goal
Merge admin and team leader pages into shared pages with role detection.

## Changes Made

### 1. ✅ Updated Main Login
- Team leaders now redirect to `/dashboard` instead of `/team-leader/dashboard`
- File: `app/page.tsx`

### 2. ⏳ Next Steps
1. Update `/app/dashboard/page.tsx` to detect team leader role and show appropriate dashboard
2. Move admin Track Orders to `/app/dashboard/track-orders/page.tsx` with role detection
3. Create `/app/dashboard/packing-queue/page.tsx` with role detection
4. Create `/app/dashboard/dispatch/page.tsx` with role detection
5. Update sidebar navigation for team leaders
6. Delete old team leader pages
7. Test both roles

## Status: IN PROGRESS
