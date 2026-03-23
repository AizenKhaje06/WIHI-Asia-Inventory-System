# 🔧 Supabase API Error - Kailangan Mo Gawin

## Problema
May error sa Supabase API: "Invalid API key" o "500 error"

## Dahilan
Yung `NEXT_PUBLIC_SUPABASE_ANON_KEY` sa `.env.local` file mo ay hindi kumpleto o mali.

---

## ✅ SOLUTION - Gawin Mo To NGAYON

### Step 1: Kumuha ng Tamang ANON KEY (Publishable Key)

1. Pumunta sa: https://app.supabase.com/project/rsvzbmhuckwndvqfhzml/settings/api
2. Hanapin yung **"anon" key** o **"publishable" key** (NOT service_role)
3. I-copy yung BUONG key (nagsisimula sa `eyJ` at sobrang haba - mga 200+ characters)

**Note:** Anon key = Publishable key (same lang yan, different terms)

### Step 2: I-update ang .env.local File

1. Buksan ang `.env.local` file
2. Hanapin yung line na:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
   ```
3. Palitan ang `YOUR_ANON_KEY_HERE` ng ANON KEY na kinopy mo
4. Dapat ganito ang itsura (example lang, yung sayo mas mahaba):
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdnpibWh1Y2t3bmR2cWZoem1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NzY0MDAsImV4cCI6MjAyNTQ1MjQwMH0.b1234567890abcdefghijklmnopqrstuvwxyz
   ```
5. I-save ang file

### Step 3: Restart Dev Server

```cmd
npm run dev
```

Kung tumatakbo na yung dev server, i-stop muna (Ctrl+C) tapos:

```cmd
rmdir /s /q .next
npm run dev
```

### Step 4: Hard Refresh Browser

Press `Ctrl + Shift + R` sa browser mo

---

## 📝 IMPORTANTE

- Yung **ANON KEY** ay PUBLIC key - safe gamitin sa client-side
- Yung **SERVICE ROLE KEY** ay SECRET - hindi dapat i-expose sa client
- Yung service role key mo ay tama na: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdnpibWh1Y2t3bmR2cWZoem1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTg3NjQwMCwiZXhwIjoyMDI1NDUyNDAwfQ.RYtE0lX_UD9B_oLZYpKpTg_6k6fU4aN`
- Kailangan mo lang ng ANON KEY

---

## ✨ After Mo Gawin

Pag nag-work na:
1. Lahat ng dashboard pages ay may bagong corporate design na ✅
2. Lahat ng API calls ay gumagana na ✅
3. Walang errors sa console ✅

---

## 🎨 Mga Na-upgrade Na Pages (30 Cards Total)

1. ✅ Low Stock Alert - 3 cards
2. ✅ Customer Management - 6 cards
3. ✅ Business Insights - 4 cards
4. ✅ Sales Analytics - 7 cards
5. ✅ Sales Channels - 4 cards
6. ✅ Activity Logs - 6 cards

**Lahat ng card design changes ay naka-maintain na!** 🎉

---

## Kung May Problema Pa Rin

Pag hindi pa rin gumagana after ng steps above:
1. Check kung tama yung ANON KEY na kinopy mo (dapat sobrang haba)
2. Check kung naka-save yung `.env.local` file
3. Check kung naka-restart na yung dev server
4. Check kung nag-hard refresh ka na sa browser

Sabihin mo lang kung may error pa, tutulungan kita! 💪
