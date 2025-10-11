# Analytics Page Daily Sales Charts Implementation

## Current Work
Adding daily sales charts to the Analytics page, inspired by the provided image. This includes a bar chart for daily revenue (calendar-style) and a line chart for sales trend over a selected time range (e.g., last 30/90 days). Existing stats cards remain. API will be updated to provide daily breakdowns.

## Key Technical Concepts
- Recharts: Using BarChart and LineChart wrapped in ChartContainer for responsive, themed charts.
- Date Grouping: Aggregate sales transactions by day (YYYY-MM-DD) in the API.
- Time Range: Frontend state for '30' or '90' days, compute startDate dynamically.
- Next.js: Update API route to accept ?daily=true and ?startDate, return dailySales array.
- TypeScript: Extend SalesReport with optional dailySales field.

## Relevant Files and Code
- lib/types.ts:
  - Add interface DailySales { date: string; revenue: number; itemsSold: number; profit: number; }
  - Update SalesReport to include dailySales?: DailySales[]
- app/api/reports/route.ts:
  - In GET handler, if searchParams.has('daily'), group salesTransactions by date using Map<Date, aggregates>, compute daily revenue/itemsSold/profit, sort by date.
  - Add dailySales to report object.
- app/analytics/page.tsx:
  - Add state: timeRange: '30' | '90' = '30'
  - Compute startDate: new Date() - parseInt(timeRange) days, format YYYY-MM-DD.
  - Fetch: `/api/reports?startDate=${startDate}&daily=true`
  - Render: Keep existing stats. Add section with selector (buttons for 30/90 days). Below: ChartContainer with BarChart (x=date, y=revenue bars). Then LineChart (x=date, y=revenue line).
  - Chart config: { revenue: { label: 'Daily Revenue', color: 'hsl(var(--primary))' } }
  - Use ChartTooltipContent for tooltips showing ₱{revenue.toFixed(2)} on hover.

## Problem Solving
- Data Availability: If no sales data, show empty chart or placeholder message.
- Date Formatting: Use toLocaleDateString for x-axis labels (e.g., 'Oct 1'), ensure sorting ascending.
- Performance: Transactions array may grow; grouping is O(n), fine for now.
- Currency: Format values as ₱{value.toFixed(2)} in tooltips/formatter.
- Responsiveness: ResponsiveContainer handles mobile/desktop.

## Pending Tasks and Next Steps
1. [ ] Update lib/types.ts: Add DailySales interface and extend SalesReport.
2. [ ] Update app/api/reports/route.ts: Implement daily grouping logic when ?daily=true.
3. [ ] Update app/analytics/page.tsx: Add timeRange state, dynamic fetch with params, render bar and line charts using Recharts components.
4. [ ] Test: Run `npm run dev`, navigate to /analytics, verify charts render with sample data (add test sales if needed), switch time ranges update charts.
5. [ ] Verify API: Manually fetch /api/reports?daily=true&startDate=2023-10-01, confirm dailySales array in response.
6. [ ] Edge cases: No data (empty charts), invalid dates (fallback to all), large date ranges (performance).
7. [ ] Update this TODO.md with [x] as steps complete.
