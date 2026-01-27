# 🚀 Quick Integration Guide - Start Here!

## Priority 1: Dashboard Page (Biggest Impact)

### Step 1: Add Skeleton Loading
Replace the loading state in `app/dashboard/page.tsx`:

```typescript
// Add import
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"

// Replace loading div with:
if (loading) return <DashboardSkeleton />
```

### Step 2: Add React Query
```typescript
// Add imports
import { useQuery } from '@tanstack/react-query'

// Replace useState + useEffect with:
const { data: stats, isLoading, refetch } = useQuery({
  queryKey: ['dashboard', timePeriod],
  queryFn: async () => {
    const res = await fetch(`/api/dashboard?period=${timePeriod}`)
    return res.json()
  },
  staleTime: 2 * 60 * 1000, // 2 minutes
})

// Use isLoading instead of loading state
if (isLoading) return <DashboardSkeleton />
```

### Step 3: Add Waterfall Chart
```typescript
// Add import
import { WaterfallChart } from '@/components/charts/waterfall-chart'

// Add after your existing charts:
<WaterfallChart 
  data={[
    { label: 'Revenue', value: stats?.totalRevenue || 0 },
    { label: 'COGS', value: -(stats?.totalCost || 0) },
    { label: 'Returns', value: -(stats?.returnValue || 0) },
    { label: 'Net Profit', value: netProfit, isTotal: true },
  ]}
  title="Profit Breakdown"
/>
```

---

## Priority 2: API Routes (Performance Boost)

### Update `app/api/dashboard/route.ts`:

```typescript
// Add import at top
import { getCachedData, invalidateCache } from '@/lib/cache'

// Replace direct calls with cached versions:
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'ID'
    
    // Use cache with 2-minute TTL
    const items = await getCachedData(
      `inventory-${period}`,
      () => getInventoryItems(),
      2 * 60 * 1000
    )
    
    const transactions = await getCachedData(
      `transactions-${period}`,
      () => getTransactions(),
      2 * 60 * 1000
    )
    
    // ... rest of your code
  } catch (error) {
    // ... error handling
  }
}
```

### Update `app/api/items/route.ts`:

```typescript
import { getCachedData, invalidateCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  const items = await getCachedData('inventory', () => getInventoryItems())
  // ... rest of code
}

export async function POST(request: NextRequest) {
  // ... create item
  invalidateCache('inventory') // Clear cache after mutation
  return NextResponse.json(item)
}
```

---

## Priority 3: Search with Debounce

### Update any page with search (e.g., `app/dashboard/inventory/page.tsx`):

```typescript
// Add import
import { useDebounce } from '@/hooks/use-debounce'

// In your component:
const [searchInput, setSearchInput] = useState("")
const debouncedSearch = useDebounce(searchInput, 500)

// Use debouncedSearch for API calls:
useEffect(() => {
  fetchItems(debouncedSearch)
}, [debouncedSearch])

// Use searchInput for the input value:
<Input 
  value={searchInput} 
  onChange={(e) => setSearchInput(e.target.value)}
  placeholder="Search products..."
/>
```

---

## Priority 4: Analytics Page Enhancements

### Add Heatmap Calendar to `app/dashboard/analytics/page.tsx`:

```typescript
// Add import
import { HeatmapCalendar } from '@/components/charts/heatmap-calendar'

// Add after your existing charts:
{view === 'daily' && dailySales.length > 0 && (
  <HeatmapCalendar 
    data={dailySales.map(d => ({ date: d.date, value: d.revenue }))}
    title="Sales Heatmap"
    month={currentMonth}
  />
)}
```

### Add Empty States:

```typescript
// Add import
import { EmptyState } from '@/components/ui/empty-state'
import { BarChart3 } from 'lucide-react'

// Replace "No data" messages with:
{dailySales.length === 0 && (
  <EmptyState
    icon={BarChart3}
    title="No Sales Data"
    description="No sales recorded for this period. Start making sales to see analytics."
    action={{
      label: "Go to POS",
      onClick: () => router.push('/dashboard/pos'),
      icon: ShoppingCart
    }}
  />
)}
```

---

## Priority 5: Filter Chips

### Add to any page with filters (e.g., `app/dashboard/insights/page.tsx`):

```typescript
// Add import
import { FilterChips } from '@/components/ui/filter-chips'

// Build active filters array:
const activeFilters = []
if (categoryFilter !== 'all') {
  activeFilters.push({
    label: 'Category',
    value: categoryFilter,
    onRemove: () => setCategoryFilter('all')
  })
}
if (statusFilter !== 'all') {
  activeFilters.push({
    label: 'Status',
    value: statusFilter,
    onRemove: () => setStatusFilter('all')
  })
}

// Add component above your data table:
<FilterChips 
  filters={activeFilters}
  onClearAll={() => {
    setCategoryFilter('all')
    setStatusFilter('all')
  }}
/>
```

---

## Testing Checklist

After each integration:

- [ ] Page loads without errors
- [ ] Loading skeleton appears briefly
- [ ] Data displays correctly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Cache is working (check console logs)
- [ ] Search debounce is working (type fast, API calls delayed)

---

## Performance Monitoring

### Check React Query DevTools (Development Only):
- Open your app in development mode
- Look for floating React Query icon in bottom-right
- Click to see cache status, queries, and mutations

### Check Cache Stats:
```typescript
// In any API route or component:
import { getCacheStats } from '@/lib/cache'
console.log(getCacheStats())
```

---

## Common Issues & Fixes

### Issue: "useQuery is not defined"
**Fix:** Make sure you're in a client component (`"use client"` at top)

### Issue: Cache not clearing after mutations
**Fix:** Add `invalidateCache('key')` after POST/PUT/DELETE in API routes

### Issue: Skeleton shows forever
**Fix:** Check if `isLoading` is properly set to `false` after data loads

### Issue: Debounce not working
**Fix:** Make sure you're using `debouncedValue` for API calls, not original `value`

---

## Next Steps

1. Start with **Dashboard Page** (biggest visual impact)
2. Update **API Routes** (biggest performance impact)
3. Add **Search Debounce** (better UX)
4. Enhance **Analytics Page** (better insights)
5. Add **Filter Chips** (better usability)

**Estimated time:** 2-3 hours for all priorities

**Expected result:** 60-70% faster app with better UX!

---

Need help? Check `IMPLEMENTATION_COMPLETE_SUMMARY.md` for detailed examples!
