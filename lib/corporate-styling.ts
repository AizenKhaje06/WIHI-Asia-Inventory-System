// Corporate Styling Template for Dashboard Pages
// This template can be applied to all dashboard pages for consistent professional styling

const CORPORATE_STYLING_TEMPLATE = {
  // Main container styling
  container: "p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen dark:from-slate-900 dark:to-slate-800",
  
  // Header styling
  header: {
    container: "mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700",
    title: "text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-2",
    subtitle: "text-slate-600 dark:text-slate-300 text-lg"
  },
  
  // Card styling
  card: {
    primary: "border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100",
    secondary: "border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
  },
  
  // Card header styling
  cardHeader: {
    container: "pb-4",
    title: "flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200",
    icon: "p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
  },
  
  // Button styling
  button: {
    primary: "gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300",
    secondary: "text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
  },
  
  // Input styling
  input: "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20",
  
  // Table styling
  table: {
    header: "border-b border-slate-200 dark:border-slate-700",
    headerCell: "pb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400",
    row: "border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200",
    cell: "py-4 text-sm font-medium text-slate-800 dark:text-slate-200"
  },
  
  // Loading skeleton styling
  skeleton: {
    container: "p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen",
    header: "mb-8",
    card: "border-0 shadow-lg bg-white/80 backdrop-blur-sm"
  }
}

export default CORPORATE_STYLING_TEMPLATE
