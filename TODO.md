# Analytics Page Calendar-Style Daily Sales Chart Implementation (Revised)

## Current Work
Overhauling the Analytics page to match the provided image exactly for daily sales. Replace existing stats and separate charts with a single calendar bar chart. Focus on daily/monthly toggle, month navigation, and grid with day bars showing total daily revenue.

## Key Technical Concepts
- Custom Calendar Layout: Use CSS Grid for 7-column week layout, dynamic rows for month days. Bars as divs with dynamic height/color based on revenue.
- Date Handling: Use date-fns or native Date for month navigation, day padding for weeks.
- API Grouping: Support ?view=daily (by day) or ?monthly (by month YYYY-MM).
- Recharts Alternative: For bars, use simple divs for exact image match (vertical bars in cells); fallback to BarChart if complex.
- Normalization: Scale bar heights to max revenue in period for visual consistency.

## Relevant Files and Code
- lib/types.ts: Add MonthlySales { month: string; revenue: number; itemsSold?: number; profit?: number; }; Update SalesReport to include monthlySales?: MonthlySales[].
- app/api/reports/route.ts:
  - Add if searchParams.get('view') === 'monthly', group salesTransactions by month (new Date(t.timestamp).toISOString().slice(0,7)), compute aggregates, add monthlySales to report.
  - For daily, keep existing but ensure for full month.
- app/analytics/page.tsx:
  - State: view: 'daily' | 'monthly' = 'daily', currentMonth: Date.
  - Compute startDate (1st of month), endDate (last of month), fetch `/api/reports?startDate=...&endDate=...&view=${view}`.
  - Header: <h1>Daily Sales</h1> (or Monthly), filter buttons toggle view/refetch.
  - Month nav: < Button onClick=prevMonth > < | > Next < Button >.
  - For daily view: Grid container, header row "Sun Mon Tue ... Sat", then week rows with day cells: if day in month, show day number + bar div (height = (revenue / maxRevenue) * 100vh, background green, tooltip on hover with ₱value).
  - For monthly view: Simple BarChart with months on x, revenue bars.
  - Empty state: "No sales data for [month]".
  - Use cn for classes, ensure responsive.

## Problem Solving
- Calendar Padding: Add empty cells for days before 1st/after last to fill weeks.
- Bar Styling: Use inline styles for height/color; green for positive sales.
- Month Names: Use toLocaleString('en-US', { month: 'short', year: 'numeric' }).
- Data Fetch: Refetch on view/month change.
- Accessibility: Add aria-labels for bars, keyboard nav if needed.

## Pending Tasks and Next Steps
1. [x] Update lib/types.ts: Add MonthlySales and extend SalesReport (previous).
2. [x] Update app/api/reports/route.ts: Add monthly grouping (previous).
3. [ ] Update app/analytics/page.tsx: Implement toggle, month nav, custom calendar grid for daily, BarChart for monthly.
4. [ ] Test: Run `npm run dev`, /analytics, toggle views, navigate months, verify bars show revenue, hover tooltips.
5. [ ] Verify API: Fetch with ?view=monthly, confirm monthlySales.
6. [ ] Edge cases: February (28/29 days), no data, year change.
7. [ ] Update this TODO.md with [x] as steps complete.
