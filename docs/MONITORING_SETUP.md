# 📊 Monitoring & Error Tracking Setup

## Quick Start (5 minutes)

Your system now includes a monitoring module at `lib/monitoring.ts` that's ready for production error tracking.

---

## 🎯 What's Already Done

✅ Monitoring service created  
✅ Error logging functions  
✅ Performance tracking  
✅ User context tracking  
✅ Event tracking  

---

## 🚀 Enable Monitoring

### Step 1: Add Environment Variable

Add to your `.env.local` or `.env.production`:

```bash
NEXT_PUBLIC_ENABLE_MONITORING=true
```

### Step 2: Use in Your Code

The monitoring is already integrated! But here's how to use it manually:

```typescript
import { logError, trackEvent, setUserContext } from '@/lib/monitoring'

// Log errors
try {
  // your code
} catch (error) {
  logError(error as Error, {
    page: '/dashboard',
    action: 'fetch_inventory',
    user: currentUser
  })
}

// Track events
trackEvent('order_cancelled', {
  orderId: 'TXN-123',
  reason: 'out_of_stock',
  amount: 1500
})

// Set user context (on login)
setUserContext({
  id: user.id,
  username: user.username,
  role: user.role
})
```

---

## 🔧 Integration Options

### Option 1: Sentry (Recommended)

**Why Sentry?**
- Free tier: 5,000 errors/month
- Real-time error tracking
- Performance monitoring
- Release tracking
- User feedback

**Setup (5 minutes):**

1. **Sign up**: https://sentry.io/signup/

2. **Install**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

3. **Update `lib/monitoring.ts`**:
```typescript
import * as Sentry from '@sentry/nextjs'

// In logError function, replace TODO with:
Sentry.captureException(error, {
  contexts: context,
  tags: {
    page: context?.page,
    action: context?.action
  }
})

// In setUserContext, replace TODO with:
Sentry.setUser({
  id: user.id,
  username: user.username,
  role: user.role
})
```

4. **Add to `.env.production`**:
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_auth_token
```

**Done!** Errors will now be tracked in Sentry dashboard.

---

### Option 2: LogRocket

**Why LogRocket?**
- Session replay (see what user saw)
- Console logs
- Network requests
- Performance monitoring

**Setup (5 minutes):**

1. **Sign up**: https://logrocket.com/signup/

2. **Install**:
```bash
npm install logrocket
```

3. **Add to `app/layout.tsx`**:
```typescript
'use client'

import LogRocket from 'logrocket'
import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      LogRocket.init('your-app-id/stocksync')
    }
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

4. **Integrate with monitoring**:
```typescript
// In lib/monitoring.ts
import LogRocket from 'logrocket'

// In logError:
LogRocket.captureException(error, {
  tags: context
})

// In setUserContext:
LogRocket.identify(user.id, {
  name: user.username,
  role: user.role
})
```

---

### Option 3: Custom Dashboard (Free)

**For budget-conscious deployments:**

1. **Create error log table in Supabase**:
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_id TEXT,
  page TEXT,
  action TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
```

2. **Update `lib/monitoring.ts`**:
```typescript
import { supabaseAdmin } from './supabase'

// In logError:
await supabaseAdmin.from('error_logs').insert({
  error_message: error.message,
  error_stack: error.stack,
  user_id: context?.user?.id,
  page: context?.page,
  action: context?.action,
  metadata: context?.metadata
})
```

3. **Create admin dashboard page** to view errors

---

## 📈 Analytics Integration

### Google Analytics 4 (Free)

1. **Create GA4 Property**: https://analytics.google.com

2. **Add to `app/layout.tsx`**:
```typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

3. **Track custom events**:
```typescript
// In lib/monitoring.ts, update trackEvent:
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', eventName, properties)
}
```

---

## 🎯 What to Monitor

### Critical Metrics:

1. **Error Rate**
   - Target: < 0.1%
   - Alert if > 1%

2. **Response Time**
   - Target: < 200ms average
   - Alert if > 500ms

3. **Uptime**
   - Target: 99.9%
   - Use UptimeRobot (free)

4. **User Actions**
   - Orders created
   - Orders cancelled
   - Inventory updates
   - Login attempts

### Business Metrics:

1. **Daily Sales**
2. **Cancelled Order Rate**
3. **Low Stock Alerts**
4. **Active Users**
5. **Peak Usage Times**

---

## 🚨 Alert Setup

### Sentry Alerts:

1. Go to **Settings → Alerts**
2. Create alert rule:
   - **Condition**: Error count > 10 in 1 hour
   - **Action**: Email/Slack notification

### UptimeRobot:

1. Sign up: https://uptimerobot.com
2. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: https://your-domain.com/api/health
   - **Interval**: 5 minutes
3. Add alert contacts (email/SMS)

---

## 📊 Dashboard Examples

### Sentry Dashboard:
- Real-time error tracking
- Error frequency graphs
- Affected users
- Stack traces
- Release comparison

### LogRocket Dashboard:
- Session replays
- User journey
- Console logs
- Network requests
- Performance metrics

### Google Analytics:
- User demographics
- Page views
- User flow
- Conversion tracking
- Real-time users

---

## 🧪 Testing Monitoring

### Test Error Logging:

```typescript
// Add to any page temporarily
import { logError } from '@/lib/monitoring'

// Trigger test error
logError(new Error('Test error'), {
  page: '/test',
  action: 'monitoring_test'
})
```

### Test Event Tracking:

```typescript
import { trackEvent } from '@/lib/monitoring'

trackEvent('test_event', {
  test: true,
  timestamp: new Date().toISOString()
})
```

Check your monitoring dashboard to verify events appear.

---

## 💰 Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Sentry** | 5K errors/month | $26/month (50K errors) |
| **LogRocket** | 1K sessions/month | $99/month (10K sessions) |
| **Google Analytics** | Unlimited | Free |
| **UptimeRobot** | 50 monitors | $7/month (unlimited) |
| **Custom (Supabase)** | Included | Included |

**Recommendation for 120-150k daily sales:**
- Start with Sentry free tier + Google Analytics
- Add LogRocket when revenue allows
- Use UptimeRobot for uptime monitoring

---

## ✅ Quick Setup Checklist

- [ ] Add `NEXT_PUBLIC_ENABLE_MONITORING=true` to env
- [ ] Choose monitoring service (Sentry recommended)
- [ ] Install and configure chosen service
- [ ] Update `lib/monitoring.ts` with integration
- [ ] Add Google Analytics
- [ ] Setup UptimeRobot
- [ ] Configure alerts
- [ ] Test error logging
- [ ] Test event tracking
- [ ] Document for team

---

## 📚 Resources

- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [LogRocket Next.js Guide](https://docs.logrocket.com/docs/nextjs)
- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)
- [UptimeRobot Documentation](https://uptimerobot.com/api/)

---

**Your monitoring is ready! 🎉**

Start with the free tiers and upgrade as your business grows.
