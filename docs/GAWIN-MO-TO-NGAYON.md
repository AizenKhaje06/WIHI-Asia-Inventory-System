# GAWIN MO TO NGAYON - Debug Department Filtering

## Step 1: Restart Localhost
```cmd
# Stop current server (Ctrl + C)
# Then restart:
npm run dev
```

## Step 2: Open Debug Tool
Buksan sa browser:
```
http://localhost:3000/test-headers.html
```

## Step 3: Check localStorage
1. Click "Check localStorage" button
2. Tingnan kung may `assignedChannel`
3. Kung WALA, problema sa login

## Step 4: Test APIs
1. Click "Test /api/orders" button
2. Tingnan ang result:
   - Kung multiple channels = MALI ❌
   - Kung 1 channel lang (Lazada) = TAMA ✅

## Step 5: Force Set (Kung hindi gumagana)
1. Click "Force Set Lazada Department"
2. Ulit ang Step 4
3. Kung gumagana na, problema sa login flow

---

## Kung Gumagana sa Test Tool pero Hindi sa Track Orders Page:

Ibig sabihin, problema sa Track Orders page mismo. Kailangan i-update yung page para gumamit ng `apiGet` properly.

---

## Check Server Logs

Tingnan sa terminal kung may ganito:
```
[Orders API] Request headers: { userRole: 'operations', assignedChannel: 'Lazada' }
[Orders API] Filtering by channel: Lazada
```

Kung WALA nito, hindi nare-receive ang headers.

---

## Quick Fix Commands

### Clear Everything:
```javascript
// Sa browser console (F12)
localStorage.clear()
sessionStorage.clear()
location.href = '/'
```

### Force Lazada Login:
```javascript
// Sa browser console
localStorage.setItem('username', 'Lazada-Carlo')
localStorage.setItem('userRole', 'operations')
localStorage.setItem('displayName', 'Carlo')
localStorage.setItem('assignedChannel', 'Lazada')
localStorage.setItem('isLoggedIn', 'true')
location.reload()
```

---

## Sabihin Mo Sakin:

1. Ano nakita mo sa test-headers.html?
2. May assignedChannel ba sa localStorage?
3. Ano ang result ng Test /api/orders?
4. Ano ang nakita mo sa server logs (terminal)?

Tapos ko na i-fix based sa sagot mo!
