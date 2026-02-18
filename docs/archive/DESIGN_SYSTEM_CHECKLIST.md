# Design System Implementation Checklist

## 🎯 Quick Reference Guide

Use this checklist when creating or updating pages to ensure design consistency.

---

## ✅ PAGE HEADER CHECKLIST

### Required Elements
- [ ] Page title uses `text-4xl font-bold gradient-text mb-2`
- [ ] Description uses `text-slate-600 dark:text-slate-400 text-base`
- [ ] Container has `mb-8` spacing
- [ ] Animation: `animate-in fade-in-0 slide-in-from-top-4 duration-700`

### Example
```tsx
<div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
  <h1 className="text-4xl font-bold gradient-text mb-2">
    Page Title
  </h1>
  <p className="text-slate-600 dark:text-slate-400 text-base">
    Page description goes here
  </p>
</div>
```

---

## ✅ BUTTON CHECKLIST

### Primary Button
- [ ] Uses neon green or gradient background
- [ ] Has `rounded-full` shape
- [ ] Includes icon with `h-4 w-4`
- [ ] Has shadow and hover effects
- [ ] Font weight is `font-semibold`

### Example
```tsx
<Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
  <Plus className="h-4 w-4" />
  Add Item
</Button>
```

---

## ✅ CARD CHECKLIST

### Standard Card
- [ ] Uses `rounded-[20px]` for border radius
- [ ] Has proper shadow (`shadow-lg`)
- [ ] Background: `bg-white dark:bg-slate-900`
- [ ] Border: `border-0` or subtle border
- [ ] Hover effect: `hover:shadow-xl transition-all duration-300`

### Card with Icon Header
- [ ] Icon container: `p-2 rounded-lg bg-gradient-to-br from-{color}-500 to-{color}-600 text-white shadow-md`
- [ ] Icon size: `h-5 w-5`
- [ ] Title: `text-xl font-semibold text-slate-900 dark:text-white`

### Example
```tsx
<Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
  <CardHeader>
    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
        <Package className="h-5 w-5" />
      </div>
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

---

## ✅ METRIC CARD CHECKLIST

### Gradient Metric Card
- [ ] Full gradient background: `bg-gradient-to-br from-{color}-500 to-{color}-600`
- [ ] Border: `border-0`
- [ ] Text: `text-white`
- [ ] Shadow: `shadow-lg hover:shadow-xl`
- [ ] Transition: `transition-all duration-300`
- [ ] Value: `text-3xl font-bold`
- [ ] Label: `text-sm font-medium text-{color}-50`

### Color Guide
- Blue: Total/Primary metrics
- Green: Revenue/Success metrics
- Purple: VIP/Premium metrics
- Orange: Warning/Average metrics
- Red: Error/Critical metrics
- Pink: Percentage/Ratio metrics

### Example
```tsx
<Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-blue-50">
      Total Revenue
    </CardTitle>
    <DollarSign className="h-5 w-5 text-white opacity-80" />
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">₱{value}</div>
  </CardContent>
</Card>
```

---

## ✅ INPUT CHECKLIST

### Standard Input
- [ ] Border radius: `rounded-lg`
- [ ] Border: `border-slate-200 dark:border-slate-700`
- [ ] Focus: `focus:border-blue-500 focus:ring-blue-500/20`
- [ ] Height: `h-11`
- [ ] Padding: `px-4 py-2.5`

### Input with Icon
- [ ] Icon position: `absolute left-3 top-1/2 -translate-y-1/2`
- [ ] Icon size: `h-4 w-4`
- [ ] Icon color: `text-slate-400`
- [ ] Input padding: `pl-10` (when icon on left)

### Example
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  <Input
    placeholder="Search..."
    className="pl-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
  />
</div>
```

---

## ✅ TABLE CHECKLIST

### Table Structure
- [ ] Container: `overflow-x-auto -mx-6 px-6`
- [ ] Inner wrapper: `min-w-full inline-block align-middle`
- [ ] Table: `w-full min-w-[800px]`
- [ ] Header border: `border-b border-slate-200 dark:border-slate-700`
- [ ] Row hover: `hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200`

### Table Headers
- [ ] Padding: `pb-3`
- [ ] Font: `text-sm font-semibold`
- [ ] Color: `text-slate-600 dark:text-slate-400`
- [ ] Alignment: `text-left` or `text-right`

### Table Cells
- [ ] Padding: `py-4`
- [ ] Font: `text-sm`
- [ ] Color: `text-slate-800 dark:text-slate-200` (primary)
- [ ] Color: `text-slate-600 dark:text-slate-400` (secondary)

---

## ✅ ANIMATION CHECKLIST

### Page Load Animations
- [ ] Header: `animate-in fade-in-0 slide-in-from-top-4 duration-700`
- [ ] First section: `duration-700 delay-100`
- [ ] Second section: `duration-700 delay-200`
- [ ] Third section: `duration-700 delay-300`
- [ ] Fourth section: `duration-700 delay-400`

### Hover Animations
- [ ] Cards: `hover:shadow-xl transition-all duration-300`
- [ ] Buttons: `hover:shadow-lg transition-all duration-300`
- [ ] Table rows: `transition-colors duration-200`
- [ ] Icons: `transition-colors duration-200`

---

## ✅ SPACING CHECKLIST

### Page Layout
- [ ] Page container: `p-6`
- [ ] Section spacing: `space-y-6`
- [ ] Page header margin: `mb-8`

### Grid Layouts
- [ ] Metric cards: `grid gap-6 md:grid-cols-2 lg:grid-cols-4`
- [ ] Content cards: `grid gap-6 md:grid-cols-2 lg:grid-cols-3`
- [ ] Two-column: `grid gap-6 lg:grid-cols-2`

### Card Spacing
- [ ] CardHeader: `p-6`
- [ ] CardContent: `p-6 pt-0`
- [ ] CardFooter: `p-6 pt-0`

---

## ✅ TYPOGRAPHY CHECKLIST

### Hierarchy
- [ ] Page title: `text-4xl font-bold gradient-text`
- [ ] Section title: `text-xl font-semibold`
- [ ] Card title: `text-lg font-semibold`
- [ ] Body text: `text-base`
- [ ] Secondary text: `text-sm text-slate-600 dark:text-slate-400`
- [ ] Caption: `text-xs text-slate-500 dark:text-slate-500`

### Colors
- [ ] Primary: `text-slate-900 dark:text-white`
- [ ] Secondary: `text-slate-600 dark:text-slate-400`
- [ ] Muted: `text-slate-500 dark:text-slate-500`
- [ ] Gradient: Use `gradient-text` class

---

## ✅ COLOR CHECKLIST

### Semantic Colors
- [ ] Success: `text-green-600` / `bg-green-500`
- [ ] Warning: `text-orange-600` / `bg-orange-500`
- [ ] Error: `text-red-600` / `bg-red-500`
- [ ] Info: `text-blue-600` / `bg-blue-500`

### Gradient Colors
- [ ] Blue: `from-blue-500 to-blue-600`
- [ ] Green: `from-green-500 to-green-600`
- [ ] Orange: `from-orange-500 to-orange-600`
- [ ] Purple: `from-purple-500 to-purple-600`
- [ ] Red: `from-red-500 to-red-600`
- [ ] Pink: `from-pink-500 to-pink-600`

### Neon Accent
- [ ] Primary: `#BFFF00`
- [ ] Hover: `#9FFF00`
- [ ] Use for: Buttons, active states, CTAs

---

## ✅ ACCESSIBILITY CHECKLIST

### Color Contrast
- [ ] Text on background: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] Interactive elements: 3:1 minimum
- [ ] Focus indicators: Visible and clear

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus order logical
- [ ] Focus indicators visible
- [ ] Keyboard shortcuts documented

### Screen Readers
- [ ] ARIA labels on icons
- [ ] Alt text on images
- [ ] Semantic HTML structure
- [ ] Skip links present

---

## ✅ RESPONSIVE CHECKLIST

### Breakpoints
- [ ] Mobile: `< 640px`
- [ ] Tablet: `640px - 1024px` (md:)
- [ ] Desktop: `> 1024px` (lg:)

### Mobile Optimizations
- [ ] Touch targets: 44x44px minimum
- [ ] Readable font sizes
- [ ] Proper spacing
- [ ] No horizontal scroll
- [ ] Stacked layouts

### Grid Responsiveness
- [ ] Mobile: 1 column
- [ ] Tablet: 2 columns (md:grid-cols-2)
- [ ] Desktop: 3-4 columns (lg:grid-cols-3 or lg:grid-cols-4)

---

## 🎨 QUICK COPY-PASTE TEMPLATES

### Complete Page Template
```tsx
export default function PageName() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Page Title
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Page description
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        {/* Metric cards here */}
      </div>

      {/* Content */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <Icon className="h-5 w-5" />
            </div>
            Section Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Content here */}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📋 PRE-COMMIT CHECKLIST

Before committing changes, verify:

- [ ] All page titles use gradient text
- [ ] Animations are consistent
- [ ] Spacing follows the system
- [ ] Border radius is correct
- [ ] Colors are semantic
- [ ] Typography hierarchy is clear
- [ ] Hover states work
- [ ] Mobile responsive
- [ ] Dark mode tested
- [ ] Accessibility verified
- [ ] No console errors
- [ ] Build succeeds

---

## 🚀 TESTING CHECKLIST

### Visual Testing
- [ ] Check in Chrome
- [ ] Check in Firefox
- [ ] Check in Safari
- [ ] Check on mobile device
- [ ] Check on tablet
- [ ] Test dark mode
- [ ] Test light mode (if applicable)

### Interaction Testing
- [ ] All buttons clickable
- [ ] Forms submit correctly
- [ ] Hover states work
- [ ] Focus states visible
- [ ] Animations smooth
- [ ] No layout shifts

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Focus indicators visible
- [ ] ARIA labels present

---

**Use this checklist for every page you create or update!**
**Consistency = Professional appearance = Better UX**
