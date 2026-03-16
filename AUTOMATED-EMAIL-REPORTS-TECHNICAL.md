# Technical Implementation Details

## 1. Database Schema

```sql
CREATE TABLE email_report_schedules (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'track_orders', 'inventory', 'sales'
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  schedule_time TEXT NOT NULL, -- '08:00' (Manila time)
  is_active BOOLEAN DEFAULT true,
  filters JSONB, -- Store filter preferences
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 2. Vercel Cron Configuration

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reports",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Schedule formats:
- Daily 8 AM: `0 8 * * *`
- Weekly Monday 8 AM: `0 8 * * 1`
- Monthly 1st 8 AM: `0 8 1 * *`

## 3. API Endpoint Structure

**`/api/cron/send-reports/route.ts`**
```typescript
export async function GET(request: NextRequest) {
  // 1. Verify cron secret
  // 2. Fetch active schedules
  // 3. Generate reports
  // 4. Send emails with attachments
  // 5. Log results
}
```

## 4. Email with Attachments

Resend supports attachments:
```typescript
await resend.emails.send({
  from: 'reports@yourdomain.com',
  to: 'recipient@email.com',
  subject: 'Track Orders Report',
  html: emailTemplate,
  attachments: [
    {
      filename: 'report.xlsx',
      content: excelBuffer
    },
    {
      filename: 'report.pdf',
      content: pdfBuffer
    }
  ]
})
```

## 5. Report Generation Flow

```
Cron Trigger
  ↓
Fetch Schedules (active recipients)
  ↓
For each recipient:
  ↓
  Fetch Orders Data
  ↓
  Generate Excel (XLSX buffer)
  ↓
  Generate PDF (HTML to PDF)
  ↓
  Send Email (Resend API)
  ↓
  Log Success/Failure
```

## 6. Admin UI Components

**Settings Page Additions:**
- Email Recipients List
- Add/Remove Recipients
- Schedule Frequency Selector
- Test Send Button
- Activity Log

## 7. Libraries Needed

Already have:
- `xlsx` - Excel generation ✅
- `resend` - Email sending ✅

Need to add:
- `puppeteer` or `jspdf` - PDF generation
- OR use HTML print (simpler)

## 8. Security Considerations

- Verify cron secret token
- Rate limit email sends
- Validate recipient emails
- Sanitize report data
- Encrypt sensitive data

## 9. Monitoring & Logs

Track:
- Emails sent successfully
- Failed sends (with reason)
- Report generation time
- Attachment sizes
- Recipient engagement

## 10. Testing Strategy

1. Test report generation locally
2. Test email sending (sandbox)
3. Test cron trigger (manual)
4. Test with real schedule
5. Monitor for 1 week

## File Size Limits

Resend attachment limits:
- Max 40MB per email
- Compress if needed
- Use cloud storage + links for large files
