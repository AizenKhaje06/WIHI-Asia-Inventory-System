# Usage Examples - UI Improvements

## 1. Using Animated Numbers in Dashboard Cards

### Before:
```tsx
<div className="text-2xl font-bold text-white">
  ₱{formatNumber(stats?.totalValue || 0)}
</div>
```

### After:
```tsx
import { AnimatedNumber } from "@/components/ui/animated-number"

<div className="text-2xl font-bold text-white">
  <AnimatedNumber 
    value={stats?.totalValue || 0} 
    prefix="₱"
    duration={2000}
  />
</div>
```

---

## 2. Using Enhanced Cards

### Before:
```tsx
<Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
  <CardHeader>
    <CardTitle>Top Products</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

### After:
```tsx
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { TrendingUp } from "lucide-react"

<EnhancedCard
  title="Top Products"
  icon={<TrendingUp className="h-4 w-4" />}
  variant="glass"
  delay={600}
>
  {/* content */}
</EnhancedCard>
```

---

## 3. Using Enhanced Chart Tooltips

### Before:
```tsx
<AreaChart data={formattedSalesData}>
  <Tooltip />
  {/* ... */}
</AreaChart>
```

### After:
```tsx
import { ChartTooltip } from "@/components/ui/chart-tooltip"

<AreaChart data={formattedSalesData}>
  <Tooltip content={<ChartTooltip />} />
  {/* ... */}
</AreaChart>
```

---

## 4. Using Shimmer Skeletons

### Before:
```tsx
<Skeleton className="h-64 w-full" />
```

### After:
```tsx
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"

<ShimmerSkeleton variant="chart" className="h-64 w-full" />
```

---

## 5. Complete Dashboard Card Example

```tsx
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { DollarSign } from "lucide-react"

<EnhancedCard
  title="Total Stocks Value"
  icon={<DollarSign className="h-4 w-4" />}
  variant="gradient"
  delay={200}
  className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white"
>
  <div className="text-2xl font-bold text-white">
    <AnimatedNumber 
      value={stats?.totalValue || 0} 
      prefix="₱"
      duration={2000}
    />
  </div>
  <p className="text-sm text-blue-100 mt-2">
    Current inventory value
  </p>
</EnhancedCard>
```

---

## 6. Staggered List Animation

```tsx
{stats?.topProducts?.map((product, index) => (
  <div 
    key={index} 
    className="flex items-center justify-between p-3 rounded-lg 
      bg-slate-50 dark:bg-slate-800 
      hover:bg-slate-100 dark:hover:bg-slate-700 
      transition-all duration-300 
      animate-in fade-in-0 slide-in-from-left-4"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <span>{product.name}</span>
    <AnimatedNumber value={product.sales} />
  </div>
))}
```

---

## 7. Enhanced Sidebar Link with Active Indicator

```tsx
<Link
  href={item.href}
  className={cn(
    "relative flex items-center rounded-lg py-2 px-3 text-sm font-medium 
    transition-all duration-300 w-full group",
    collapsed ? "justify-center" : "gap-2",
    isActive
      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50"
      : "text-white hover:bg-white/10 hover:text-white"
  )}
>
  {isActive && (
    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
      bg-white rounded-r-full animate-pulse" />
  )}
  <item.icon className={cn(
    "h-4 w-4 flex-shrink-0 transition-transform duration-300",
    isActive ? "text-white scale-110" : "text-orange-400 group-hover:scale-110"
  )} />
  {!collapsed && <span>{item.name}</span>}
</Link>
```

---

## 8. Loading State with Shimmer

```tsx
{loading ? (
  <div className="grid gap-6 md:grid-cols-2">
    <ShimmerSkeleton variant="card" className="h-64" />
    <ShimmerSkeleton variant="card" className="h-64" />
  </div>
) : (
  <div className="grid gap-6 md:grid-cols-2">
    {/* Actual content */}
  </div>
)}
```

---

## 9. Chart with Enhanced Tooltip

```tsx
import { ChartTooltip } from "@/components/ui/chart-tooltip"

<ResponsiveContainer width="100%" height={350}>
  <AreaChart data={formattedSalesData}>
    <defs>
      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
    <YAxis stroke="#64748B" fontSize={12} />
    <Tooltip 
      content={<ChartTooltip />}
      formatter={(value, name) => [`₱${formatNumber(value)}`, name]}
    />
    <Area 
      type="monotone" 
      dataKey="sales" 
      stroke="#3B82F6" 
      strokeWidth={3} 
      fill="url(#salesGradient)" 
      name="Sales Revenue" 
    />
  </AreaChart>
</ResponsiveContainer>
```

---

## Quick Migration Guide

1. **Replace static numbers** with `<AnimatedNumber />`
2. **Replace basic cards** with `<EnhancedCard />`
3. **Replace chart tooltips** with `<ChartTooltip />`
4. **Replace skeletons** with `<ShimmerSkeleton />`
5. **Add staggered delays** to list items
6. **Enhance sidebar links** with active indicators

All components are backward compatible and can be adopted incrementally!

