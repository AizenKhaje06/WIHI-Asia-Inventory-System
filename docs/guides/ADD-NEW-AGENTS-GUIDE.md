# How to Add New Agents to Departments

**Date**: May 12, 2026  
**Feature**: Multiple agents per department with individual passwords

---

## Overview

Each department (Facebook, TikTok, Lazada, Shopee, Physical Store) can have multiple agents. Each agent has their own username and password.

**Username Format**: `Department-AgentName`
- Example: `Facebook-Juan`, `TikTok-Pedro`, `Lazada-Carlo`

---

## Step 1: Add Agent to Database

Run this SQL in Supabase SQL Editor:

```sql
-- Add a new agent to Facebook department
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('fb_newagent_' || extract(epoch from now())::text, 'Facebook-NewAgentName', 'password123', 'operations', 'NewAgentName (Facebook)', 'Facebook')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;
```

**Replace**:
- `fb_newagent_` → Department prefix (fb, tt, lz, sp, ps)
- `Facebook-NewAgentName` → Username (Department-AgentName format)
- `password123` → Agent's password
- `NewAgentName (Facebook)` → Display name
- `Facebook` → Assigned channel

---

## Step 2: Add Agent to Login Form

**File**: `components/auth/login-form.tsx`

Find the department section and add the new agent:

```tsx
{/* Facebook Agents */}
<div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Facebook</div>
<SelectItem value="Facebook">
  <div className="flex items-center gap-2">
    <img src="/facebook.png" alt="Facebook" className="h-4 w-4" />
    <span>Facebook (Main)</span>
  </div>
</SelectItem>
<SelectItem value="Facebook-Juan">
  <div className="flex items-center gap-2 pl-6">
    <span>Juan</span>
  </div>
</SelectItem>
<SelectItem value="Facebook-Maria">
  <div className="flex items-center gap-2 pl-6">
    <span>Maria</span>
  </div>
</SelectItem>
<!-- ADD NEW AGENT HERE -->
<SelectItem value="Facebook-NewAgentName">
  <div className="flex items-center gap-2 pl-6">
    <span>NewAgentName</span>
  </div>
</SelectItem>
```

---

## Step 3: Add Agent to Internal Usage Page

**File**: `app/dashboard/internal-usage/page.tsx`

Find the dispatch modal agent dropdown (around line 1129) and add the same agent:

```tsx
{/* Facebook Agents */}
<div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Facebook</div>
<SelectItem value="Facebook">
  <div className="flex items-center gap-2">
    <img src="/facebook.png" alt="Facebook" className="h-4 w-4" />
    <span>Facebook (Main)</span>
  </div>
</SelectItem>
<SelectItem value="Facebook-Juan">
  <div className="flex items-center gap-2 pl-6">
    <span>Juan</span>
  </div>
</SelectItem>
<!-- ADD NEW AGENT HERE -->
<SelectItem value="Facebook-NewAgentName">
  <div className="flex items-center gap-2 pl-6">
    <span>NewAgentName</span>
  </div>
</SelectItem>
```

---

## Example: Add 3 Agents to TikTok

### Step 1: Database
```sql
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('tt_mark_' || extract(epoch from now())::text, 'TikTok-Mark', 'mark123', 'operations', 'Mark (TikTok)', 'TikTok'),
  ('tt_sarah_' || extract(epoch from now())::text, 'TikTok-Sarah', 'sarah123', 'operations', 'Sarah (TikTok)', 'TikTok'),
  ('tt_john_' || extract(epoch from now())::text, 'TikTok-John', 'john123', 'operations', 'John (TikTok)', 'TikTok')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;
```

### Step 2 & 3: Add to both files
```tsx
{/* TikTok Agents */}
<div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">TikTok</div>
<SelectItem value="TikTok">
  <div className="flex items-center gap-2">
    <img src="/tiktok.png" alt="TikTok" className="h-4 w-4" />
    <span>TikTok (Main)</span>
  </div>
</SelectItem>
<SelectItem value="TikTok-Pedro">
  <div className="flex items-center gap-2 pl-6">
    <span>Pedro</span>
  </div>
</SelectItem>
<SelectItem value="TikTok-Ana">
  <div className="flex items-center gap-2 pl-6">
    <span>Ana</span>
  </div>
</SelectItem>
<!-- NEW AGENTS -->
<SelectItem value="TikTok-Mark">
  <div className="flex items-center gap-2 pl-6">
    <span>Mark</span>
  </div>
</SelectItem>
<SelectItem value="TikTok-Sarah">
  <div className="flex items-center gap-2 pl-6">
    <span>Sarah</span>
  </div>
</SelectItem>
<SelectItem value="TikTok-John">
  <div className="flex items-center gap-2 pl-6">
    <span>John</span>
  </div>
</SelectItem>
```

---

## Current Agents (After Migration 040)

### Facebook
- Facebook (Main) - `facebook123`
- Juan - `juan123`
- Maria - `maria123`

### TikTok
- TikTok (Main) - `tiktok123`
- Pedro - `pedro123`
- Ana - `ana123`

### Lazada
- Lazada (Main) - `lazada123`
- Carlo - `carlo123`
- Lisa - `lisa123`

### Shopee
- Shopee (Main) - `shopee123`
- Rico - `rico123`
- Nina - `nina123`

### Physical Store
- Physical Store (Main) - `physical123`
- Ben - `ben123`
- Jane - `jane123`

---

## Testing

1. Run migration 040 in Supabase
2. Restart dev server
3. Go to login page → Operations tab
4. Select an agent (e.g., "Juan" under Facebook)
5. Enter password: `juan123`
6. Should login successfully and show "Juan (Facebook)" in navbar

---

## Notes

- Each agent has their own password
- Agents are grouped by department in the dropdown
- Display name format: `AgentName (Department)`
- Username format: `Department-AgentName`
- All agents have `role='operations'` and their department in `assigned_channel`

