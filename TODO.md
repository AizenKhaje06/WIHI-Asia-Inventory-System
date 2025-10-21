# TODO: Add Sales & Purchase Analytics Chart

## Tasks
- [x] Update dashboard page to pass selected timePeriod as query parameter to /api/dashboard
- [x] Modify API route to accept 'period' query parameter
- [x] Implement dynamic salesOverTime calculation based on period:
  - ID (Today): Last 24 hours, hourly data points
  - 1W: Last 7 days, daily data points
  - 1M: Last 30 days, daily data points
  - 3M: Last 90 days, weekly data points
  - 6M: Last 180 days, weekly data points
  - 1Y: Last 365 days, monthly data points
- [x] Ensure chart displays data when available and handles empty periods gracefully
- [x] Test the implementation with different time periods
