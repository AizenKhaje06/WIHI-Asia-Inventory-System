# Supabase Client Import Fix

## Error
```
Error: (...__WEBPACK_IMPORTED_MODULE_1__...createClient) is not a function
```

## Root Cause
The code was trying to import and call `createClient` as a function from `@/lib/supabase`:

```typescript
import { createClient } from '@/lib/supabase'
const supabase = createClient()  // ❌ ERROR: createClient is not exported
```

However, `lib/supabase.ts` exports `supabase` and `supabaseAdmin` as **constants**, not a `createClient` function.

## Correct Exports from lib/supabase.ts
```typescript
export const supabase = createClient(...)        // ✅ Client instance
export const supabaseAdmin = createClient(...)   // ✅ Admin instance
```

## Solution
Changed all API routes to import the `supabase` constant directly instead of trying to call `createClient()`:

### Before (Wrong) ❌
```typescript
import { createClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createClient()  // ❌ Not a function!
  // ...
}
```

### After (Correct) ✅
```typescript
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Use supabase directly
  const { data } = await supabase.from('orders').select('*')
  // ...
}
```

## Files Fixed

### 1. app/api/orders/route.ts ✅
**Changed**:
- Import: `createClient` → `supabase`
- Removed: `const supabase = createClient()` calls
- Now uses: `supabase` directly

### 2. app/api/departments/[id]/route.ts ✅
**Changed**:
- Import: `createClient` → `supabase`
- Removed: `const supabase = createClient()` call in parcel status query
- Now uses: `supabase` directly

## Testing
- [x] Orders API GET works
- [x] Orders API POST works
- [x] Departments detail API works
- [x] Parcel status counts load correctly
- [x] No more "createClient is not a function" errors

## Why This Happened
When we previously fixed the Track Orders page error, we changed from `supabaseAdmin` to `createClient()`, but we incorrectly assumed `createClient` was exported as a function from `@/lib/supabase`. 

The actual exports are:
- `supabase` - Regular client (anon key)
- `supabaseAdmin` - Admin client (service role key)

Both are already instantiated clients, not factory functions.

---

**Status**: ✅ FIXED
**Date**: March 4, 2026
**Impact**: Critical - Prevents order submission errors
