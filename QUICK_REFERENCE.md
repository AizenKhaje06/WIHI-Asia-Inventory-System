# Quick Reference Guide - Enterprise Features

## 🚀 Quick Start

### Import Utilities
```typescript
// Accessibility
import { announceToScreenReader, meetsContrastRequirement } from '@/lib/accessibility'
import { useReducedMotion, useKeyboardNavigation } from '@/hooks/use-accessibility'

// Performance
import { debounce, throttle, isLowEndDevice } from '@/lib/performance'
import { useDebounce, useLowEndDevice } from '@/hooks/use-performance'

// Testing
import { runAccessibilityAudit, validateColorContrast } from '@/lib/testing'
```

---

## 📋 Common Use Cases

### 1. Announce to Screen Readers
```typescript
import { announceToScreenReader } from '@/lib/accessibility'

// After adding item to cart
announceToScreenReader('Item added to cart successfully', 'polite')

// For urgent messages
announceToScreenReader('Error: Please check your input', 'assertive')
```

### 2. Debounce Search Input
```typescript
import { useDebounce } from '@/hooks/use-performance'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  // This only runs 300ms after user stops typing
  fetchResults(debouncedSearch)
}, [debouncedSearch])
```

### 3. Respect Reduced Motion
```typescript
import { useReducedMotion } from '@/hooks/use-accessibility'

const reducedMotion = useReducedMotion()

<div className={cn(
  "card",
  reducedMotion ? "" : "animate-fade-in"
)}>
  Content
</div>
```

### 4. Detect Low-End Device
```typescript
import { useLowEndDevice } from '@/hooks/use-performance'

const isLowEnd = useLowEndDevice()

// Disable heavy animations on low-end devices
<div className={cn(
  "component",
  !isLowEnd && "backdrop-blur-xl"
)}>
  Content
</div>
```

### 5. Validate Color Contrast
```typescript
import { validateColorContrast } from '@/lib/testing'

const result = validateColorContrast('#3b82f6', '#ffffff', 'AA')
if (!result.passes) {
  console.warn(`Contrast ratio ${result.ratio}:1 fails WCAG ${result.required}:1`)
}
```

### 6. Run Accessibility Audit
```typescript
import { runAccessibilityAudit } from '@/lib/testing'

// Run on page load or after dynamic content
const audit = runAccessibilityAudit(document.body)
console.log(`Accessibility Score: ${audit.score}/100`)
audit.issues.forEach(issue => {
  console.warn(issue.message, issue.element)
})
```

### 7. Monitor Performance
```typescript
import { PerformanceMonitor } from '@/lib/performance'

const monitor = new PerformanceMonitor()

// Measure sync function
monitor.start('render')
renderComponent()
const duration = monitor.end('render')

// Measure async function
const asyncDuration = await monitor.measureAsync('fetch', async () => {
  await fetchData()
})
```

### 8. Check Network Quality
```typescript
import { getNetworkQuality } from '@/lib/testing'

const network = getNetworkQuality()
if (network?.effectiveType === '2g' || network?.effectiveType === 'slow-2g') {
  // Load low-quality images
  // Disable auto-play videos
  // Reduce animations
}
```

---

## 🎨 CSS Classes

### Accessibility
```css
.sr-only              /* Screen reader only */
.skip-to-main         /* Skip to main content link */
```

### Performance
```css
.gpu-accelerated      /* GPU acceleration */
.contain-layout       /* Layout containment */
.contain-paint        /* Paint containment */
.contain-strict       /* Strict containment */
```

### Mobile
```css
.table-container      /* Horizontal scroll with indicator */
```

---

## 🔧 Configuration

### Next.js Config
```javascript
// next.config.mjs already configured with:
// - Security headers
// - Image optimization
// - Code splitting
// - Compression
// - Caching strategies
```

### Accessibility Features
```typescript
// Automatically enabled:
// - Focus visible indicators
// - Reduced motion support
// - High contrast mode
// - Touch target validation
// - Screen reader support
```

---

## 📊 Testing Commands

### Browser Console
```javascript
// Run accessibility audit
import { runAccessibilityAudit } from '@/lib/testing'
runAccessibilityAudit()

// Check memory usage
import { getMemoryUsage } from '@/lib/testing'
getMemoryUsage()

// Check browser compatibility
import { checkBrowserCompatibility } from '@/lib/testing'
checkBrowserCompatibility()
```

### Lighthouse
```bash
# Run in Chrome DevTools
# Cmd/Ctrl + Shift + I > Lighthouse tab
# Target scores: 90+ for all categories
```

---

## 🎯 Best Practices

### 1. Always Add ARIA Labels
```typescript
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>
```

### 2. Use Semantic HTML
```typescript
<nav aria-label="Main navigation">
  <main id="main-content">
    <aside aria-label="Sidebar">
```

### 3. Respect User Preferences
```typescript
const reducedMotion = useReducedMotion()
const isKeyboardUser = useKeyboardNavigation()
```

### 4. Optimize Performance
```typescript
const debouncedValue = useDebounce(value, 300)
const isLowEnd = useLowEndDevice()
```

### 5. Handle Errors Gracefully
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

---

## 🐛 Debugging

### Check Accessibility Issues
```typescript
const audit = runAccessibilityAudit()
console.table(audit.issues)
```

### Monitor Performance
```typescript
const monitor = new PerformanceMonitor()
monitor.start('operation')
// ... your code
console.log('Duration:', monitor.end('operation'))
```

### Check Memory Leaks
```typescript
const memory = getMemoryUsage()
console.log(`Memory: ${memory?.used}MB / ${memory?.total}MB (${memory?.percentage}%)`)
```

---

## 📱 Mobile Testing

### Test Checklist
- [ ] Touch targets are 48x48px minimum
- [ ] Mobile menu works correctly
- [ ] Tables scroll horizontally
- [ ] Forms are easy to fill
- [ ] Buttons are easy to tap
- [ ] Text is readable without zoom

### Test Devices
- iPhone 12/13/14
- Samsung Galaxy S21
- iPad Pro
- Various screen sizes

---

## 🌐 Browser Testing

### Test Checklist
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### Compatibility Check
```typescript
const compat = checkBrowserCompatibility()
if (!compat.isSupported) {
  console.warn('Missing features:', compat.missingFeatures)
}
```

---

## 🔒 Security

### Headers Configured
- ✅ Strict-Transport-Security
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### Best Practices
- Always use HTTPS
- Sanitize user input
- Validate on server-side
- Use secure cookies
- Implement CSRF protection

---

## 📈 Performance Tips

### Code Splitting
```typescript
// Use dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

### Image Optimization
```typescript
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

### Lazy Loading
```typescript
const { isIntersecting } = useIntersectionObserver(ref)
{isIntersecting && <ExpensiveComponent />}
```

---

## 🎓 Learning Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Docs](https://nextjs.org/docs)
- [Web.dev](https://web.dev/learn/)

### Tools
- Chrome DevTools
- Lighthouse
- axe DevTools
- WAVE Extension

---

## 💡 Pro Tips

1. **Test with keyboard only** - Tab through your entire app
2. **Use screen reader** - Test with NVDA (Windows) or VoiceOver (Mac)
3. **Check color contrast** - Use browser extensions
4. **Monitor performance** - Use Chrome DevTools Performance tab
5. **Test on real devices** - Emulators are not enough

---

## 🆘 Common Issues

### Issue: Focus not visible
```typescript
// Solution: Check if focus-visible is working
*:focus-visible {
  outline: 3px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Issue: Animations too fast
```typescript
// Solution: Respect reduced motion
const reducedMotion = useReducedMotion()
```

### Issue: Mobile menu not closing
```typescript
// Solution: Check mobile state management
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
```

---

## ✅ Pre-Deployment Checklist

- [ ] Run accessibility audit (score 95+)
- [ ] Run Lighthouse (all scores 90+)
- [ ] Test on mobile devices
- [ ] Test on all browsers
- [ ] Check console for errors
- [ ] Verify security headers
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Check color contrast
- [ ] Verify error boundaries work

---

*Quick Reference v2.0.0 - Enterprise Edition*
