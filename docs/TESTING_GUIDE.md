# 🧪 Testing Guide

## Overview

This guide covers testing strategies for the StockSync inventory system.

---

## 📋 Test Structure

```
__tests__/
├── api/              # API endpoint tests
│   └── health.test.ts
├── lib/              # Utility function tests
│   └── auth.test.ts
└── components/       # Component tests (add as needed)
```

---

## 🚀 Quick Start

### Install Testing Dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @jest/globals
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test __tests__/lib/auth.test.ts
```

---

## ✅ Current Test Coverage

### 1. Health Check API (`__tests__/api/health.test.ts`)

Tests the `/api/health` endpoint:
- ✅ Returns 200 status
- ✅ Returns healthy status
- ✅ Includes timestamp

### 2. Authentication (`__tests__/lib/auth.test.ts`)

Tests auth utility functions:
- ✅ Admin permissions
- ✅ Operations permissions
- ✅ Role definitions

---

## 📝 Writing Tests

### API Endpoint Test Example

```typescript
import { describe, it, expect } from '@jest/globals'

describe('/api/your-endpoint', () => {
  it('should return expected data', async () => {
    const response = await fetch('http://localhost:3001/api/your-endpoint')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('expectedField')
  })
})
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import YourComponent from '@/components/YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Utility Function Test Example

```typescript
import { describe, it, expect } from '@jest/globals'
import { yourFunction } from '@/lib/your-module'

describe('yourFunction', () => {
  it('returns expected result', () => {
    const result = yourFunction('input')
    expect(result).toBe('expected output')
  })
})
```

---

## 🎯 Testing Checklist

### Critical Paths to Test

- [ ] **Authentication**
  - [x] Permission checks
  - [ ] Login flow
  - [ ] Logout flow
  - [ ] Session management

- [ ] **Inventory Management**
  - [ ] Add item
  - [ ] Update item
  - [ ] Delete item
  - [ ] Low stock detection
  - [ ] Out of stock detection

- [ ] **Transactions**
  - [ ] Create sale
  - [ ] Cancel transaction
  - [ ] Transaction history
  - [ ] Revenue calculations

- [ ] **Cancelled Orders**
  - [ ] Cancel with customer info
  - [ ] View cancelled orders
  - [ ] Filter cancelled orders
  - [ ] Export cancelled orders

- [ ] **API Endpoints**
  - [x] Health check
  - [ ] Items API
  - [ ] Transactions API
  - [ ] Reports API
  - [ ] Dashboard API

---

## 🔄 CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Before deployment

See `.github/workflows/ci.yml` for configuration.

---

## 📊 Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| **API Routes** | 10% | 80% |
| **Utilities** | 20% | 90% |
| **Components** | 0% | 70% |
| **Overall** | 5% | 75% |

---

## 🧪 Manual Testing Checklist

Before each release, manually test:

### User Flows

- [ ] **Admin Login**
  - [ ] Login with correct credentials
  - [ ] Login with wrong credentials
  - [ ] Logout

- [ ] **Operations Login**
  - [ ] Login with correct credentials
  - [ ] Access allowed pages
  - [ ] Cannot access admin pages

- [ ] **Inventory Management**
  - [ ] Add new product
  - [ ] Edit product
  - [ ] Delete product
  - [ ] View low stock items
  - [ ] View out of stock items

- [ ] **Sales Operations**
  - [ ] Create sale transaction
  - [ ] View transaction history
  - [ ] Cancel transaction
  - [ ] Add customer information

- [ ] **Cancelled Orders**
  - [ ] View cancelled orders list
  - [ ] Filter by reason
  - [ ] Filter by staff
  - [ ] Export to CSV
  - [ ] View order details

- [ ] **Analytics**
  - [ ] View dashboard metrics
  - [ ] View sales analytics
  - [ ] View business insights
  - [ ] Export reports

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Device Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Large Desktop (2560x1440)

---

## 🐛 Bug Report Template

When you find a bug during testing:

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Screen Size: [e.g. 1920x1080]
- User Role: [e.g. Admin]

## Additional Context
[Any other relevant information]
```

---

## 🚀 Performance Testing

### Load Testing with k6

1. **Install k6**: https://k6.io/docs/getting-started/installation/

2. **Create test script** (`tests/load-test.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
};

export default function () {
  let response = http.get('http://localhost:3001/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

3. **Run load test**:
```bash
k6 run tests/load-test.js
```

### Performance Benchmarks

| Endpoint | Target | Current |
|----------|--------|---------|
| `/api/health` | < 50ms | ✅ ~20ms |
| `/api/items` | < 200ms | ⚠️ ~150ms |
| `/api/reports` | < 500ms | ⚠️ ~400ms |
| `/api/dashboard` | < 300ms | ⚠️ ~250ms |

---

## 📚 Testing Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [k6 Load Testing](https://k6.io/docs/)

---

## ✅ Pre-Deployment Testing

Before deploying to production:

1. **Run all automated tests**
   ```bash
   npm test
   ```

2. **Run build**
   ```bash
   npm run build
   ```

3. **Manual smoke test**
   - Login as admin
   - Create a test transaction
   - Cancel a transaction
   - View reports
   - Logout

4. **Performance check**
   - Run load test
   - Check response times
   - Monitor memory usage

5. **Security check**
   ```bash
   npm audit
   ```

6. **Browser compatibility**
   - Test on Chrome, Firefox, Safari
   - Test on mobile devices

---

## 🎯 Next Steps

To improve test coverage:

1. **Add Component Tests**
   - Test critical UI components
   - Test form validations
   - Test user interactions

2. **Add Integration Tests**
   - Test complete user flows
   - Test API integrations
   - Test database operations

3. **Add E2E Tests**
   - Use Playwright or Cypress
   - Test critical business flows
   - Test across browsers

4. **Add Visual Regression Tests**
   - Use Percy or Chromatic
   - Catch UI regressions
   - Ensure design consistency

---

**Your testing foundation is ready! 🎉**

Start with the existing tests and gradually expand coverage.
