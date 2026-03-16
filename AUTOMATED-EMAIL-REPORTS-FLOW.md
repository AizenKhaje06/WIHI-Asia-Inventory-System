# Automated Email Reports - Complete Flow

## 📋 SETUP PHASE (One-time)

### Step 1: Admin Configuration
```
Admin logs in
  ↓
Goes to Settings > Email Reports
  ↓
Adds recipient emails:
  - boss@company.com
  - manager@company.com
  - accounting@company.com
  ↓
Sets schedule:
  - Frequency: Daily / Weekly / Monthly
  - Time: 8:00 AM Manila Time
  - Report Type: Track Orders
  ↓
Clicks "Save Settings"
  ↓
System saves to database
```

### Step 2: Database Storage
```sql
email_report_schedules table:
┌─────────────────────────────────────────────┐
│ id: "SCHED-001"                             │
│ recipient_email: "boss@company.com"         │
│ report_type: "track_orders"                 │
│ frequency: "daily"                          │
│ schedule_time: "08:00"                      │
│ is_active: true                             │
│ filters: { status: "all", channel: "all" } │
└─────────────────────────────────────────────┘
```

---

## ⏰ DAILY AUTOMATED FLOW

### 8:00 AM - Vercel Cron Triggers

```
┌─────────────────────────────────────────────┐
│  VERCEL CRON SCHEDULER                      │
│  Time: 8:00 AM Manila Time                  │
│  Triggers: /api/cron/send-reports           │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STEP 1: Verify Cron Secret                │
│  - Check authorization token                │
│  - Prevent unauthorized access              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STEP 2: Fetch Active Schedules             │
│  Query: SELECT * FROM email_report_schedules│
│         WHERE is_active = true              │
│         AND frequency = 'daily'             │
│                                             │
│  Result: 3 recipients found                 │
│  - boss@company.com                         │
│  - manager@company.com                      │
│  - accounting@company.com                   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STEP 3: Fetch Track Orders Data           │
│  - Get all packed orders                    │
│  - Apply filters (if any)                   │
│  - Calculate statistics                     │
│                                             │
│  Data Retrieved:                            │
│  - 150 orders                               │
│  - Total: ₱450,000                          │
│  - Delivered: 120                           │
│  - In Transit: 25                           │
│  - Pending: 5                               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STEP 4: Generate Excel Report              │
│  - Create workbook                          │
│  - Add summary sheet                        │
│  - Add detailed orders                      │
│  - Format cells                             │
│  - Convert to buffer                        │
│                                             │
│  Output: excelBuffer (2.5 MB)              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STEP 5: Generate PDF Report                │
│  - Create HTML template                     │
│  - Add charts & tables                      │
│  - Convert HTML to PDF                      │
│  - Compress if needed                       │
│                                             │
│  Output: pdfBuffer (1.8 MB)                │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STEP 6: Send Email (Loop for each)        │
│                                             │
│  For boss@company.com:                      │
│  ┌─────────────────────────────────────┐   │
│  │ Resend API Call                     │   │
│  │ From: reports@yourdomain.com        │   │
│  │ To: boss@company.com                │   │
│  │ Subject: Track Orders Report        │   │
│  │         March 15, 2026              │   │
│  │                                     │   │
│  │ Body: HTML Email Template           │   │
│  │ - Summary stats                     │   │
│  │ - Key insights                      │   │
│  │ - Quick links                       │   │
│  │                                     │   │
│  │ Attachments:                        │   │
│  │ - Track_Orders_2026-03-15.xlsx     │   │
│  │ - Track_Orders_2026-03-15.pdf      │   │
│  └─────────────────────────────────────┘   │
│              ↓                              │
│  ✅ Email sent successfully                 │
│                                             │
│  Repeat for manager@company.com...          │
│  Repeat for accounting@company.com...       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STEP 7: Log Results                        │
│  - Save to email_logs table                 │
│  - Record success/failure                   │
│  - Track delivery status                    │
│                                             │
│  Log Entry:                                 │
│  ┌─────────────────────────────────────┐   │
│  │ timestamp: 2026-03-15 08:00:15      │   │
│  │ recipients: 3                       │   │
│  │ success: 3                          │   │
│  │ failed: 0                           │   │
│  │ report_size: 4.3 MB                 │   │
│  │ generation_time: 12.5s              │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
              ↓
         ✅ DONE!
```

---

## 📧 EMAIL RECEIVED BY RECIPIENT

```
┌──────────────────────────────────────────────┐
│  📨 Inbox: boss@company.com                  │
├──────────────────────────────────────────────┤
│  From: Track Orders System                   │
│  Subject: 📊 Track Orders Report - Mar 15    │
│  Time: 8:00 AM                               │
│  Attachments: 2 files (4.3 MB)               │
├──────────────────────────────────────────────┤
│                                              │
│  Good morning!                               │
│                                              │
│  Here's your daily Track Orders report:      │
│                                              │
│  📦 SUMMARY                                  │
│  ├─ Total Orders: 150                       │
│  ├─ Total Amount: ₱450,000                  │
│  ├─ Delivered: 120 (80%)                    │
│  ├─ In Transit: 25 (17%)                    │
│  └─ Pending: 5 (3%)                         │
│                                              │
│  💡 KEY INSIGHTS                             │
│  • Delivery rate improved by 5%             │
│  • Shopee orders increased 15%              │
│  • No problematic parcels today             │
│                                              │
│  📎 ATTACHMENTS                              │
│  • Track_Orders_2026-03-15.xlsx (2.5 MB)   │
│  • Track_Orders_2026-03-15.pdf (1.8 MB)    │
│                                              │
│  [View Online Dashboard] [Unsubscribe]      │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🔄 WEEKLY/MONTHLY FLOW

Same process, but:
- **Weekly**: Runs every Monday 8 AM
- **Monthly**: Runs 1st day of month 8 AM
- Includes date range in report (last 7 days / last 30 days)

---

## 🛠️ ADMIN MANAGEMENT FLOW

### View Activity Log
```
Admin → Settings → Email Reports → Activity Log
  ↓
Shows table:
┌────────────┬──────────────┬─────────┬────────┐
│ Date       │ Recipients   │ Success │ Failed │
├────────────┼──────────────┼─────────┼────────┤
│ Mar 15 8AM │ 3            │ 3       │ 0      │
│ Mar 14 8AM │ 3            │ 3       │ 0      │
│ Mar 13 8AM │ 3            │ 2       │ 1      │
└────────────┴──────────────┴─────────┴────────┘
```

### Test Send
```
Admin clicks "Test Send Now"
  ↓
System immediately:
  - Generates reports
  - Sends to admin email only
  - Shows success/error message
  ↓
Admin receives test email in 10-30 seconds
```

### Add/Remove Recipients
```
Admin → Add Recipient
  ↓
Enter: newperson@company.com
  ↓
System validates email format
  ↓
Saves to database
  ↓
Next scheduled send includes new recipient
```

---

## ⚠️ ERROR HANDLING FLOW

```
If email send fails:
  ↓
System logs error
  ↓
Retries 3 times (with 5 min delay)
  ↓
If still fails:
  - Logs final failure
  - Sends alert to admin
  - Marks recipient as "delivery_failed"
  ↓
Admin can manually resend or fix email
```

---

## 📊 PERFORMANCE

- **Report Generation**: 10-15 seconds
- **Email Sending**: 2-5 seconds per recipient
- **Total Time**: ~30 seconds for 3 recipients
- **File Sizes**: 2-5 MB total
- **Success Rate**: 99%+ (with Resend)

---

## 🎯 KEY BENEFITS

1. **Zero Manual Work** - Fully automated
2. **Always On Time** - Exact schedule
3. **Professional** - Branded emails
4. **Reliable** - Error handling & retries
5. **Scalable** - Add unlimited recipients
6. **Trackable** - Full activity logs
