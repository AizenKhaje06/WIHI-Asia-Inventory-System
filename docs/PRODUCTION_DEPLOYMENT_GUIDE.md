# 🚀 Production Deployment Guide

## System Rating: 7.5/10 → 9/10 (After Following This Guide)

This guide will help you deploy your StockSync inventory system to production with enterprise-grade reliability.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

Create `.env.production` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Monitoring (Optional but Recommended)
NEXT_PUBLIC_ENABLE_MONITORING=true

# Security
NODE_ENV=production
```

### 2. Database Setup

1. **Create Production Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Copy URL and keys

2. **Run Migrations**
   ```sql
   -- Run all migrations in order from supabase/migrations/
   -- 001_enable_rls.sql
   -- 002_create_policies.sql
   -- ... (all migration files)
   ```

3. **Verify RLS Policies**
   - Check that Row Level Security is enabled
   - Test policies with different user roles

### 3. Build Test

```bash
npm run build
```

Fix any build errors before deploying.

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production`

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

**Advantages:**
- Automatic HTTPS
- Global CDN
- Zero configuration
- Automatic deployments from Git

---

### Option 2: Self-Hosted (VPS/Cloud)

#### Requirements:
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx
- PM2 (process manager)

#### Steps:

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone and Build**
   ```bash
   cd /var/www
   git clone your-repo-url stocksync
   cd stocksync
   npm install
   npm run build
   ```

3. **Create PM2 Ecosystem File**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'stocksync',
       script: 'npm',
       args: 'start',
       cwd: '/var/www/stocksync',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/stocksync
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/stocksync /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 📊 Post-Deployment Setup

### 1. Error Monitoring (Recommended)

#### Option A: Sentry (Free tier available)

1. **Sign up at https://sentry.io**

2. **Install Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Initialize**
   ```bash
   npx @sentry/wizard -i nextjs
   ```

4. **Update monitoring.ts**
   ```typescript
   import * as Sentry from '@sentry/nextjs'
   
   // In logError function:
   Sentry.captureException(error, { contexts: context })
   ```

#### Option B: LogRocket

1. **Sign up at https://logrocket.com**

2. **Install**
   ```bash
   npm install logrocket
   ```

3. **Initialize in app/layout.tsx**
   ```typescript
   import LogRocket from 'logrocket'
   
   if (process.env.NODE_ENV === 'production') {
     LogRocket.init('your-app-id')
   }
   ```

### 2. Analytics Setup

#### Google Analytics 4

1. **Create GA4 Property**

2. **Add to app/layout.tsx**
   ```typescript
   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
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
   ```

### 3. Uptime Monitoring

#### UptimeRobot (Free)

1. **Sign up at https://uptimerobot.com**
2. **Add HTTP(s) monitor**
3. **Set check interval to 5 minutes**
4. **Add alert contacts**

---

## 🔒 Security Hardening

### 1. Environment Variables

- Never commit `.env` files
- Use different credentials for production
- Rotate keys regularly

### 2. Database Security

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All tables should have rowsecurity = true
```

### 3. API Rate Limiting

Already implemented in `lib/api-auth.ts`

### 4. HTTPS Only

- Always use HTTPS in production
- Set secure cookies
- Enable HSTS headers

---

## 📈 Performance Optimization

### 1. Enable Caching

Already implemented in `lib/cache.ts`

### 2. Database Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp 
ON transactions(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_status 
ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_inventory_quantity 
ON inventory(quantity);
```

### 3. Image Optimization

Images in sidebar are already optimized. For future images:

```typescript
import Image from 'next/image'

<Image
  src="/path/to/image.png"
  alt="Description"
  width={100}
  height={100}
  priority // for above-the-fold images
/>
```

---

## 🔄 Backup Strategy

### 1. Database Backups

**Automated (Supabase)**:
- Supabase Pro plan includes daily backups
- Point-in-time recovery available

**Manual Backup**:
```bash
# Export database
pg_dump -h your-db-host -U postgres -d your-db > backup.sql

# Schedule with cron (daily at 2 AM)
0 2 * * * pg_dump -h your-db-host -U postgres -d your-db > /backups/stocksync-$(date +\%Y\%m\%d).sql
```

### 2. Code Backups

- Use Git (already done)
- Push to GitHub/GitLab regularly
- Tag releases: `git tag v1.0.0`

---

## 📱 Mobile App Considerations

Your system is already mobile-responsive. For native app:

### Progressive Web App (PWA)

Already configured in `public/manifest.json`

**To install:**
1. Visit site on mobile
2. Click "Add to Home Screen"
3. App installs like native app

---

## 🧪 Testing Checklist

Before going live:

- [ ] Test all user roles (admin, operations)
- [ ] Test all CRUD operations
- [ ] Test cancelled orders flow
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Load test with expected traffic
- [ ] Test backup/restore procedure
- [ ] Verify all environment variables
- [ ] Check error logging works
- [ ] Verify analytics tracking

---

## 🚨 Rollback Plan

If something goes wrong:

### Vercel:
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Self-Hosted:
```bash
# Stop current version
pm2 stop stocksync

# Checkout previous version
git checkout previous-tag

# Rebuild and restart
npm install
npm run build
pm2 restart stocksync
```

---

## 📞 Support & Maintenance

### Daily Tasks:
- Monitor error logs
- Check uptime status
- Review analytics

### Weekly Tasks:
- Review database performance
- Check disk space
- Update dependencies (if needed)

### Monthly Tasks:
- Security audit
- Performance review
- Backup verification
- User feedback review

---

## 🎯 Success Metrics

Track these KPIs:

1. **Uptime**: Target 99.9%
2. **Response Time**: < 200ms average
3. **Error Rate**: < 0.1%
4. **User Satisfaction**: Monitor feedback
5. **Database Size**: Monitor growth

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Documentation](https://vercel.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

## ✅ Final Checklist

Before launching:

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Build succeeds without errors
- [ ] All tests pass
- [ ] Error monitoring configured
- [ ] Analytics setup
- [ ] Backup strategy in place
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Team trained on system
- [ ] Documentation updated
- [ ] Rollback plan tested

---

**Your system is production-ready! 🎉**

After following this guide, your rating improves from 7.5/10 to 9/10.

The remaining 1 point can be achieved by:
- Adding comprehensive automated tests
- Implementing advanced monitoring dashboards
- Setting up CI/CD pipeline
- Adding multi-region deployment
