# Automated Email Reports - Implementation Plan

## Overview
Automatic scheduled email reports for Track Orders page with Excel and PDF attachments.

## Current Setup
✅ Resend API already configured
✅ API Key: `re_75RciFGJ_EszksxcLbJxVjDkEPzEUrAud`
✅ From Email: `onboarding@resend.dev`
✅ Export functions exist (Excel & PDF)

## Architecture Options

### Option 1: Vercel Cron Jobs (Recommended)
**Best for**: Production deployment on Vercel

**Pros**:
- Native Vercel integration
- No additional infrastructure
- Reliable scheduling
- Free tier available

**Cons**:
- Requires Vercel deployment
- Limited to specific time intervals

### Option 2: Node-Cron + Always-On Server
**Best for**: Self-hosted or VPS deployment

**Pros**:
- Full control over schedule
- Works on any Node.js server
- More flexible timing

**Cons**:
- Requires server to be always running
- More complex setup

### Option 3: External Scheduler (GitHub Actions)
**Best for**: Free automated scheduling

**Pros**:
- Completely free
- No server needed
- Easy to configure

**Cons**:
- Requires public API endpoint
- Less real-time control

## Recommended Implementation (Vercel Cron)

### Files to Create:

1. **`app/api/cron/send-reports/route.ts`**
   - Cron endpoint that runs on schedule
   - Fetches track orders data
   - Generates Excel and PDF
   - Sends via Resend with attachments

2. **`vercel.json`** (update existing)
   - Add cron configuration
   - Set schedule (daily, weekly, etc.)

3. **`lib/email-reports.ts`**
   - Helper functions for report generation
   - Email template
   - Attachment handling

4. **Database table: `email_report_schedules`**
   - Store recipient emails
   - Schedule preferences
   - Report types
   - Active/inactive status

### Schedule Options:
- Daily: 8:00 AM Manila time
- Weekly: Monday 8:00 AM
- Monthly: 1st day of month 8:00 AM
- Custom: User-defined

### Email Content:
- Subject: "Track Orders Report - [Date]"
- Body: Summary statistics + links
- Attachments: Excel + PDF files
- Professional HTML template

## Features to Include:

1. **Admin Settings Page**
   - Add/remove recipient emails
   - Set schedule frequency
   - Enable/disable reports
   - Test send button

2. **Report Customization**
   - Date range selection
   - Status filters
   - Sales channel filters
   - Include/exclude sections

3. **Email Template**
   - Company branding
   - Summary statistics
   - Quick insights
   - Download links (if files too large)

4. **Error Handling**
   - Retry failed sends
   - Log errors
   - Admin notifications
   - Fallback options

## Cost Estimate:
- Resend Free Tier: 100 emails/day
- Vercel Cron: Free (Hobby plan)
- Total: FREE for basic usage

## Next Steps:
1. Confirm deployment platform (Vercel?)
2. Decide on schedule frequency
3. List recipient emails
4. Implement code (if approved)
