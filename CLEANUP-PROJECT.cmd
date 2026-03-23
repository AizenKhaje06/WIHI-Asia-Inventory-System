@echo off
echo ========================================
echo  PROJECT CLEANUP - Removing Old Files
echo ========================================
echo.

REM Create archive-old folder if it doesn't exist
if not exist "archive-old" mkdir archive-old

echo Moving old documentation to archive-old...

REM Move old MD files to archive
move "ACCOUNT_TEST_RESULTS.md" archive-old\ 2>nul
move "ADMIN-DASHBOARD-CORPORATE-UPGRADE.md" archive-old\ 2>nul
move "AYOS-NA-CAMERA.md" archive-old\ 2>nul
move "BALIK-SA-DATI-INVENTORY-ONLY.md" archive-old\ 2>nul
move "BEFORE-AFTER-COMPARISON.md" archive-old\ 2>nul
move "BEFORE-AFTER-PACKER.md" archive-old\ 2>nul
move "BUILD-ERROR-FIXED.md" archive-old\ 2>nul
move "BUILD-ERRORS-FIXED.md" archive-old\ 2>nul
move "BUNDLE-CACHE-FIX.md" archive-old\ 2>nul
move "BUNDLE-FIX-GUIDE.md" archive-old\ 2>nul
move "BUNDLE-MODAL-IMPROVEMENTS.md" archive-old\ 2>nul
move "BUNDLE-MODAL-UPDATES.md" archive-old\ 2>nul
move "BUNDLES-INCLUDED-FIX.md" archive-old\ 2>nul
move "BUNDLES-IN-INVENTORY-COMPLETE.md" archive-old\ 2>nul
move "BUNDLE-VIRTUAL-STOCK.md" archive-old\ 2>nul
move "CACHE-BUSTING-FIX.md" archive-old\ 2>nul
move "CACHE-CLEARED-RESTART-NOW.md" archive-old\ 2>nul
move "CAMERA-FIX-COMPLETE.md" archive-old\ 2>nul
move "CAMERA-FIX-TAGALOG.md" archive-old\ 2>nul
move "CAMERA-ISSUE-RESOLVED.md" archive-old\ 2>nul
move "CAMERA-PERMISSION-FIX-GUIDE.md" archive-old\ 2>nul
move "CLEAR-OLD-SESSION-NOW.md" archive-old\ 2>nul
move "COMPLETE-SESSION-SUMMARY.md" archive-old\ 2>nul
move "CORPORATE-DESIGN-COMPLETE-ALL-PAGES.md" archive-old\ 2>nul
move "CORPORATE-DESIGN-SESSION-COMPLETE.md" archive-old\ 2>nul
move "CURRENT-SESSION-COMPLETE.md" archive-old\ 2>nul
move "CURRENT-STATUS.md" archive-old\ 2>nul
move "DASHBOARD-REFINEMENT-COMPLETE.md" archive-old\ 2>nul
move "DASHBOARD-VISUAL-IMPROVEMENTS-COMPLETE.md" archive-old\ 2>nul
move "DATA-ACCURACY-FIX-ANALYTICS-PAGE.md" archive-old\ 2>nul
move "DATA-ACCURACY-ISSUE-SALES-CHANNEL-VS-DASHBOARD.md" archive-old\ 2>nul
move "DATABASE-TIMESTAMP-EXPLANATION.md" archive-old\ 2>nul
move "DEBUG-TEAM-LEADER-LOGIN.md" archive-old\ 2>nul
move "DISPATCH-FORM-DATE-FIX-COMPLETE.md" archive-old\ 2>nul
move "EMAIL-REPORTS-ALL-COLUMNS-COMPLETE.md" archive-old\ 2>nul
move "EMAIL-REPORTS-DATA-FIX-COMPLETE.md" archive-old\ 2>nul
move "EMAIL-REPORTS-DATE-RANGE-COMPLETE.md" archive-old\ 2>nul
move "EMAIL-REPORTS-FIX-SUMMARY.md" archive-old\ 2>nul
move "EMAIL-REPORTS-MANAGEMENT-COMPLETE.md" archive-old\ 2>nul
move "EMAIL-REPORTS-MINIMALIST-REDESIGN.md" archive-old\ 2>nul
move "EXPORT-BUTTON-ADMIN-ONLY.md" archive-old\ 2>nul
move "EXPORT-BUTTON-UPGRADE-COMPLETE.md" archive-old\ 2>nul
move "FINAL-BUNDLE-SOLUTION.md" archive-old\ 2>nul
move "FINAL-FIX-SUMMARY.md" archive-old\ 2>nul
move "FINAL-TIMEZONE-FIX-COMPLETE.md" archive-old\ 2>nul
move "FIX-211-ERRORS-PROBLEM-EDITOR.md" archive-old\ 2>nul
move "FIX-404-HARD-REFRESH-ISSUE.md" archive-old\ 2>nul
move "FIX-OLD-LOGIN-PAGE-TAGALOG.md" archive-old\ 2>nul
move "FIX-TEAM-LEADER-401.md" archive-old\ 2>nul
move "FORCE-DEPLOY-NOW.md" archive-old\ 2>nul
move "FULL-REFACTOR-COMPLETE.md" archive-old\ 2>nul
move "GITHUB-COMPLETE-UPDATE-MARCH-13-FINAL.md" archive-old\ 2>nul
move "GITHUB-LATEST-UPDATES-MARCH-13.md" archive-old\ 2>nul
move "GITHUB-SYNC-COMPLETE-MARCH-17.md" archive-old\ 2>nul
move "GITHUB-UPDATE-INDEX.md" archive-old\ 2>nul
move "GITHUB-UPDATE-MARCH-14-2026.md" archive-old\ 2>nul
move "GITHUB-UPDATE-SUMMARY.md" archive-old\ 2>nul
move "HARD-REFRESH-404-FIX.md" archive-old\ 2>nul
move "HARD-REFRESH-FIX-FINAL.md" archive-old\ 2>nul
move "HARD-REFRESH-FIX-QUICK-TEST.md" archive-old\ 2>nul
move "HARD-REFRESH-REAL-FIX.md" archive-old\ 2>nul
move "HYDRATION-ERROR-FIXED.md" archive-old\ 2>nul
move "INTEGRATION-COMPLETE-SUMMARY.md" archive-old\ 2>nul
move "INTERNAL-USAGE-AUTO-FILTER-FIX.md" archive-old\ 2>nul
move "INTERNAL-USAGE-FILTER-FIX.md" archive-old\ 2>nul
move "INTERNAL-USAGE-SESSION-FIX-COMPLETE.md" archive-old\ 2>nul
move "INTERNAL-USAGE-TABLE-LAYOUT-FIX.md" archive-old\ 2>nul
move "INVENTORY-3-CARDS-WITH-COGS.md" archive-old\ 2>nul
move "INVENTORY-COLUMN-WIDTH-PERSISTENCE.md" archive-old\ 2>nul
move "INVENTORY-EXPORT-RESTOCK-INFO.md" archive-old\ 2>nul
move "INVENTORY-PAGE-EXCLUDE-BUNDLES.md" archive-old\ 2>nul
move "INVENTORY-VALUE-FIX.md" archive-old\ 2>nul
move "LATEST_GITHUB_UPDATES.md" archive-old\ 2>nul
move "LATEST-SESSION-UPDATE-MARCH-17-2026.md" archive-old\ 2>nul
move "LATEST-UPDATE-SUMMARY.md" archive-old\ 2>nul
move "LOGIN-ENTERPRISE-UPGRADE-COMPLETE.md" archive-old\ 2>nul
move "LOGIN-INTEGRATION-COMPLETE.md" archive-old\ 2>nul
move "LOGIN-PAGE-ENTERPRISE-UPGRADE.md" archive-old\ 2>nul
move "LOGIN-PAGE-PRODUCTION-UPGRADE-COMPLETE.md" archive-old\ 2>nul
move "LOGIN-TEXT-FIX-TAGALOG.md" archive-old\ 2>nul
move "MANUAL-INPUT-VISUAL-GUIDE.md" archive-old\ 2>nul
move "MOBILE-CARD-LAYOUT-COMPLETE.md" archive-old\ 2>nul
move "NEW-COMPONENTS-OVERVIEW.md" archive-old\ 2>nul
move "OPTION-B-SUMMARY.md" archive-old\ 2>nul
move "PACKER-DASHBOARD-10-10-UPGRADE.md" archive-old\ 2>nul
move "PACKER-ENTERPRISE-UPGRADE-COMPLETE.md" archive-old\ 2>nul
move "PACKER-IMPLEMENTATION-COMPLETE.md" archive-old\ 2>nul
move "PACKER-IMPLEMENTATION-SUMMARY.md" archive-old\ 2>nul
move "PACKER-LOGOUT-AND-NAVIGATION-FIX.md" archive-old\ 2>nul
move "PACKER-MOBILE-OPTIMIZED.md" archive-old\ 2>nul
move "PACKER-PORTAL-PROFESSIONAL-UPGRADE.md" archive-old\ 2>nul
move "PACKER-QUICK-START-TAGALOG.md" archive-old\ 2>nul
move "PACKER-QUICK-START-UPDATED.md" archive-old\ 2>nul
move "PACKER-ROLE-COMPLETE-SUMMARY.md" archive-old\ 2>nul
move "PACKER-ROLE-IMPLEMENTATION.md" archive-old\ 2>nul
move "PACKER-VISUAL-GUIDE.md" archive-old\ 2>nul
move "PACKING-QUEUE-TIME-ADDED.md" archive-old\ 2>nul
move "PACKING-QUEUE-TIME-FIX-COMPLETE.md" archive-old\ 2>nul
move "PRODUCTS-CHANNEL-FILTER-COMPLETE.md" archive-old\ 2>nul
move "PULL-AND-INTEGRATE-CHECKLIST.md" archive-old\ 2>nul
move "QUICK-PULL-GUIDE.md" archive-old\ 2>nul
move "QUICK-REFERENCE-REFACTOR.md" archive-old\ 2>nul
move "README-BUNDLE-FIX.md" archive-old\ 2>nul
move "README-LATEST-UPDATE.md" archive-old\ 2>nul
move "README-TEAM-LEADER-DASHBOARD.md" archive-old\ 2>nul
move "READY-TO-PUSH-SUMMARY.md" archive-old\ 2>nul
move "REAL-FIX-COMPLETE.md" archive-old\ 2>nul
move "REFACTOR-COMPLETE-TRACK-ORDERS.md" archive-old\ 2>nul
move "REFACTOR-FINAL-SUMMARY.md" archive-old\ 2>nul
move "REFACTOR-IN-PROGRESS.md" archive-old\ 2>nul
move "REFACTOR-STATUS-FINAL.md" archive-old\ 2>nul
move "REFACTOR-SUCCESS.md" archive-old\ 2>nul
move "RESTART-DEV-SERVER.md" archive-old\ 2>nul
move "RESTART-SERVER-NOW.md" archive-old\ 2>nul
move "RESTOCK-INFO-ADDED.md" archive-old\ 2>nul
move "RESUME-SUMMARY.md" archive-old\ 2>nul
move "REVENUE-CHART-UNITS-SOLD-COMPLETE.md" archive-old\ 2>nul
move "RUN_MIGRATION_033.md" archive-old\ 2>nul
move "RUN_PACKER_MIGRATION.md" archive-old\ 2>nul
move "RUN-CATEGORIES-MIGRATION.md" archive-old\ 2>nul
move "RUN-MIGRATION-035-NOW.md" archive-old\ 2>nul
move "RUN-MIGRATION-036-NOW.md" archive-old\ 2>nul
move "SALES-ANALYTICS-UNITS-SOLD-COMPLETE.md" archive-old\ 2>nul
move "SALES-CHANNEL-DATA-FIX-COMPLETE.md" archive-old\ 2>nul
move "SALES-CHANNEL-FILTER-COMPLETE.md" archive-old\ 2>nul
move "SALES-CHANNEL-FILTER-FIX.md" archive-old\ 2>nul
move "SALES-CHANNEL-FILTER-PACKER-COMPLETE.md" archive-old\ 2>nul
move "SEARCH-BAR-REDESIGN-COMPLETE.md" archive-old\ 2>nul
move "SELECTITEM-FIX-COMPLETE.md" archive-old\ 2>nul
move "SESSION-COMPLETE-SUMMARY.md" archive-old\ 2>nul
move "SESSION-FIX-FINAL.md" archive-old\ 2>nul
move "SESSION-PERSISTENCE-FIX.md" archive-old\ 2>nul
move "SESSION-RESUME-COMPLETE.md" archive-old\ 2>nul
move "SESSION-VALIDATION-FIX.md" archive-old\ 2>nul
move "SETTINGS-PAGE-PROFESSIONAL-UPGRADE.md" archive-old\ 2>nul
move "SETUP_TEAM_LEADER_NOW.md" archive-old\ 2>nul
move "SHARED-PAGES-IMPLEMENTATION.md" archive-old\ 2>nul
move "SHARED-PAGES-REFACTOR-STATUS.md" archive-old\ 2>nul
move "SILENT-REFRESH-COMPLETE.md" archive-old\ 2>nul
move "SOLUTION-FINAL.md" archive-old\ 2>nul
move "START-HERE-REFACTOR.md" archive-old\ 2>nul
move "STORE-PERFORMANCE-SALES-BASED-COMPLETE.md" archive-old\ 2>nul
move "STUCK-404-SOLUTION.md" archive-old\ 2>nul
move "SUPABASE-API-FIX-GUIDE.md" archive-old\ 2>nul
move "TABLE-DESIGN-UPDATE-COMPLETE.md" archive-old\ 2>nul
move "TAPOS-NA-LAHAT.md" archive-old\ 2>nul
move "TAPOS-NA-PACKER-ROLE.md" archive-old\ 2>nul
move "TEAM_LEADER_PAGES_COMPARISON.md" archive-old\ 2>nul
move "TEAM-LEADER-404-FIX.md" archive-old\ 2>nul
move "TEAM-LEADER-ARCHITECTURE.md" archive-old\ 2>nul
move "TEAM-LEADER-CHECKLIST.md" archive-old\ 2>nul
move "TEAM-LEADER-DASHBOARD-ENHANCED.md" archive-old\ 2>nul
move "TEAM-LEADER-FULL-ACCESS.md" archive-old\ 2>nul
move "TEAM-LEADER-IMPLEMENTATION-COMPLETE.md" archive-old\ 2>nul
move "TEAM-LEADER-INDEX.md" archive-old\ 2>nul
move "TEAM-LEADER-LOGIN-FIX.md" archive-old\ 2>nul
move "TEAM-LEADER-NEXT-STEPS.md" archive-old\ 2>nul
move "TEAM-LEADER-QUICK-START.md" archive-old\ 2>nul
move "TEAM-LEADER-REFACTOR-PLAN.md" archive-old\ 2>nul
move "TEAM-LEADER-SETUP-COMPLETE.md" archive-old\ 2>nul
move "TEAM-LEADER-SIDEBAR-FIX.md" archive-old\ 2>nul
move "TEAM-LEADER-SUMMARY.md" archive-old\ 2>nul
move "TEAM-LEADER-TESTING-GUIDE.md" archive-old\ 2>nul
move "TEAM-LEADER-VISUAL-GUIDE.md" archive-old\ 2>nul
move "TEST_AUTH_CONNECTIONS.md" archive-old\ 2>nul
move "TEST-EMAIL-REPORTS-NOW.md" archive-old\ 2>nul
move "TEST-SESSION-FIX-NOW.md" archive-old\ 2>nul
move "THEME-TOGGLE-UPGRADE-COMPLETE.md" archive-old\ 2>nul
move "TIMEZONE-FIX-COMPLETE.md" archive-old\ 2>nul
move "TRACK-ORDERS-DATE-FIX-COMPLETE.md" archive-old\ 2>nul
move "TRACK-ORDERS-HEADER-UPDATE.md" archive-old\ 2>nul
move "TRACK-ORDERS-REFACTOR-VISUAL.md" archive-old\ 2>nul
move "TYPESCRIPT-ERRORS-FIXED.md" archive-old\ 2>nul
move "USERNAME-EDITABLE-COMPLETE.md" archive-old\ 2>nul
move "VERCEL-404-FIX-PACKING-QUEUE.md" archive-old\ 2>nul
move "VERCEL-FORCE-REDEPLOY.md" archive-old\ 2>nul
move "WAREHOUSE-TRANSFER-FEATURE.md" archive-old\ 2>nul
move "WATCHPACK-ERROR-FIX.md" archive-old\ 2>nul
move "WHAT-TO-DO-NEXT.md" archive-old\ 2>nul

REM Move old TXT files
move "ADMIN-DASHBOARD-UPGRADED-TAGALOG.txt" archive-old\ 2>nul
move "AYOS-NA-211-ERRORS.txt" archive-old\ 2>nul
move "AYOS-NA-INVENTORY-WALANG-BUNDLES.txt" archive-old\ 2>nul
move "AYOS-NA-TALAGA-TO.txt" archive-old\ 2>nul
move "AYUSIN-STUCK-404-NGAYON.txt" archive-old\ 2>nul
move "BUNDLES-FIX-TAGALOG.txt" archive-old\ 2>nul
move "FINAL-404-SOLUTION-GAWIN-MO-TO.txt" archive-old\ 2>nul
move "GAWIN-MO-TO-NGAYON.txt" archive-old\ 2>nul
move "GAWIN-MO-TO-PARA-SA-404.txt" archive-old\ 2>nul
move "GIT-COMMIT-INSTRUCTIONS.txt" archive-old\ 2>nul
move "INTEGRATION-READY.txt" archive-old\ 2>nul
move "INVENTORY-VALUE-FIX-TAGALOG.txt" archive-old\ 2>nul
move "QUICK-FIX.txt" archive-old\ 2>nul
move "TAMA-KA-BUNDLES-HINDI-KASAMA.txt" archive-old\ 2>nul

REM Move old SQL helper files (keep important ones)
move "CHECK-BUNDLES-TABLE.sql" archive-old\ 2>nul
move "CHECK-EMAIL-REPORT-DATA.sql" archive-old\ 2>nul
move "CHECK-EMAIL-SCHEDULES.sql" archive-old\ 2>nul
move "CHECK-ORDERS-TIMESTAMPS.sql" archive-old\ 2>nul
move "DEBUG-INVENTORY-VALUE.sql" archive-old\ 2>nul
move "DELETE-DUPLICATE-BERRY-SOAP.sql" archive-old\ 2>nul
move "FIX-EXISTING-BUNDLES.sql" archive-old\ 2>nul
move "INSERT-EMAIL-SCHEDULE-EXAMPLE.sql" archive-old\ 2>nul
move "TEAM-LEADER-TEST-SETUP.sql" archive-old\ 2>nul
move "TEST_BUNDLE_COLUMNS.sql" archive-old\ 2>nul
move "ADD-DATE-RANGE-COLUMNS-NOW.sql" archive-old\ 2>nul

REM Delete old CMD files (keep useful ones)
del "CHECK-IF-FILES-EXIST.cmd" 2>nul
del "CLEAR-CACHE-AND-TEST.cmd" 2>nul
del "CLEAR-CACHE-NOW.cmd" 2>nul
del "COMMIT-CHANGES-NOW.cmd" 2>nul
del "EMERGENCY-FIX-RENAME-ROUTE.cmd" 2>nul
del "FINAL-FIX-BUNDLE-NOW.cmd" 2>nul
del "FINAL-FIX-DEPLOY-NOW.cmd" 2>nul
del "FIND-THE-DIFFERENCE.cmd" 2>nul
del "FIX-404-NUCLEAR-OPTION.cmd" 2>nul
del "FIX-BUNDLE-NOW.cmd" 2>nul
del "FORCE-REDEPLOY-FIX-404.cmd" 2>nul
del "FULL-COMMIT.cmd" 2>nul
del "NUCLEAR-CACHE-CLEAR.cmd" 2>nul
del "RESTART-NOW.cmd" 2>nul
del "TEST-FIX-NOW.cmd" 2>nul
del "TEST-HARD-REFRESH-FIX.cmd" 2>nul
del "TEST-LOCAL-PACKING-QUEUE.cmd" 2>nul

echo.
echo ========================================
echo  CLEANUP COMPLETE!
echo ========================================
echo.
echo Moved to archive-old:
echo - Old documentation files (.md)
echo - Old notes (.txt)
echo - Old SQL helper scripts
echo.
echo Deleted:
echo - Temporary CMD scripts
echo.
echo Kept in root:
echo - README.md (main documentation)
echo - SUPABASE_MIGRATION_GUIDE.md (important)
echo - AUTOMATED-EMAIL-REPORTS-DONE.md (current feature)
echo - FIX-DUPLICATE-PRODUCTS.md (current task)
echo - VERCEL-ENV-SETUP-GUIDE.md (deployment guide)
echo - SETUP-EMAIL-REPORTS-QUICK-GUIDE.md (user guide)
echo - GITHUB-UPDATE-MARCH-23-2026.md (latest update)
echo.
echo Kept CMD files:
echo - QUICK-COMMIT.cmd (for quick commits)
echo - COMMIT-AND-PUSH.cmd (backup commit script)
echo - CHECK-ERRORS.cmd (useful for debugging)
echo.
echo Kept SQL files:
echo - CHECK_ALL_ACCOUNTS.sql (account management)
echo - CHECK_USERS_TABLE.sql (user management)
echo - CREATE_PACKER_ACCOUNT.sql (setup script)
echo - DELETE-ZERO-STOCK-DUPLICATES.sql (current task)
echo - FIND-ALL-DUPLICATES.sql (current task)
echo - FIX_ROLE_CONSTRAINT.sql (database fix)
echo - UPDATE_PACKER_PASSWORD.sql (account management)
echo.
pause
