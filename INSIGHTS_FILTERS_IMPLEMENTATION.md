# Business Insights - Filters Implementation Guide

## ✅ What's Been Added

### 1. Filter State Variables
```typescript
// ABC Analysis filters
const [abcSearch, setAbcSearch] = useState("")
const [abcCategoryFilter, setAbcCategoryFilter] = useState("all")
const [abcSortBy, setAbcSortBy] = useState("revenue-desc")

// Turnover filters
const [turnoverSearch, setTurnoverSearch] = useState("")
const [turnoverStatusFilter, setTurnoverStatusFilter] = useState("all")
const [turnoverSortBy, setTurnoverSortBy] = useState("ratio-desc")

// Forecast filters
const [forecastSearch, setForecastSearch] = useState("")
const [forecastTrendFilter, setForecastTrendFilter] = useState("all")
const [forecastSortBy, setForecastSortBy] = useState("demand-desc")

// Profit filters
const [profitSearch, setProfitSearch] = useState("")
const [profitSortBy, setProfitSortBy] = useState("margin-desc")

// Dead Stock filters
const [deadStockSearch, setDeadStockSearch] = useState("")
const [deadStockCategoryFilter, setDeadStockCategoryFilter] = useState("all")
const [deadStockSortBy, setDeadStockSortBy] = useState("value-desc")
```

### 2. Filtering Logic
✅ Added filtered data arrays for all tabs
✅ Search functionality
✅ Category/Status filtering
✅ Sort options

### 3. Imports Added
✅ Input component
✅ Label component
✅ Select components
✅ Search and X icons

## 🔄 Next Steps - Filter UI Components

### For Each Tab, Add This Filter Section:

#### ABC Analysis Tab
```tsx
<Card className="mb-4 border-0 shadow-md bg-white dark:bg-slate-900">
  <CardContent className="p-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={abcSearch}
            onChange={(e) => setAbcSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Category</Label>
        <Select value={abcCategoryFilter} onValueChange={setAbcCategoryFilter}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="A">Category A</SelectItem>
            <SelectItem value="B">Category B</SelectItem>
            <SelectItem value="C">Category C</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
        <Select value={abcSortBy} onValueChange={setAbcSortBy}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue-desc">Revenue % (High to Low)</SelectItem>
            <SelectItem value="revenue-asc">Revenue % (Low to High)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    {(abcSearch || abcCategoryFilter !== "all") && (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredAbcAnalysis.length} of {abcAnalysis.length} items
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAbcSearch("")
            setAbcCategoryFilter("all")
          }}
          className="h-7 text-xs gap-1"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

#### Turnover Tab
```tsx
<Card className="mb-4 border-0 shadow-md bg-white dark:bg-slate-900">
  <CardContent className="p-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={turnoverSearch}
            onChange={(e) => setTurnoverSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Status</Label>
        <Select value={turnoverStatusFilter} onValueChange={setTurnoverStatusFilter}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="fast-moving">Fast Moving</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="slow-moving">Slow Moving</SelectItem>
            <SelectItem value="dead-stock">Dead Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
        <Select value={turnoverSortBy} onValueChange={setTurnoverSortBy}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ratio-desc">Turnover Ratio (High to Low)</SelectItem>
            <SelectItem value="ratio-asc">Turnover Ratio (Low to High)</SelectItem>
            <SelectItem value="days-asc">Days to Sell (Low to High)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>
```

#### Forecast Tab
```tsx
<Card className="mb-4 border-0 shadow-md bg-white dark:bg-slate-900">
  <CardContent className="p-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={forecastSearch}
            onChange={(e) => setForecastSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Trend</Label>
        <Select value={forecastTrendFilter} onValueChange={setForecastTrendFilter}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trends</SelectItem>
            <SelectItem value="increasing">Increasing</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="decreasing">Decreasing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
        <Select value={forecastSortBy} onValueChange={setForecastSortBy}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="demand-desc">Predicted Demand (High to Low)</SelectItem>
            <SelectItem value="demand-asc">Predicted Demand (Low to High)</SelectItem>
            <SelectItem value="confidence-desc">Confidence (High to Low)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>
```

#### Profit Tab
```tsx
<Card className="mb-4 border-0 shadow-md bg-white dark:bg-slate-900">
  <CardContent className="p-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search categories..."
            value={profitSearch}
            onChange={(e) => setProfitSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
        <Select value={profitSortBy} onValueChange={setProfitSortBy}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="margin-desc">Margin % (High to Low)</SelectItem>
            <SelectItem value="margin-asc">Margin % (Low to High)</SelectItem>
            <SelectItem value="revenue-desc">Revenue (High to Low)</SelectItem>
            <SelectItem value="profit-desc">Profit (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>
```

#### Dead Stock Tab
```tsx
<Card className="mb-4 border-0 shadow-md bg-white dark:bg-slate-900">
  <CardContent className="p-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={deadStockSearch}
            onChange={(e) => setDeadStockSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Category</Label>
        <Select value={deadStockCategoryFilter} onValueChange={setDeadStockCategoryFilter}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {/* Add your categories here */}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
        <Select value={deadStockSortBy} onValueChange={setDeadStockSortBy}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value-desc">Value (High to Low)</SelectItem>
            <SelectItem value="value-asc">Value (Low to High)</SelectItem>
            <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>
```

## 🔄 Update Table Data References

Replace all instances in tables:
- `abcAnalysis.slice(0, 20)` → `filteredAbcAnalysis.slice(0, 20)`
- `turnover.slice(0, 20)` → `filteredTurnover.slice(0, 20)`
- `forecasts.slice(0, 20)` → `filteredForecasts.slice(0, 20)`
- `profitMargin.map` → `filteredProfitMargin.map`
- `deadStock.map` → `filteredDeadStock.map`

## ✅ Status

- ✅ Filter state variables added
- ✅ Filtering logic implemented
- ✅ Imports added
- 🔄 Filter UI components (need to be added to each tab)
- 🔄 Table data references (need to be updated)

The filtering logic is ready! Just need to add the UI components to each tab.
