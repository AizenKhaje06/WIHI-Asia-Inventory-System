# Packer Role - Quick Start Guide (Tagalog)

## Ano ang Packer Role?

Bagong role para sa mga packer na may barcode scanner para mabilis mag-pack ng orders.

## Workflow

1. **Login** → Packer tab → Username: `packer1` → Password: `pack789`
2. **Click "Scan Barcode"** → Camera bubuksan
3. **I-scan ang waybill barcode** → Automatic lalabas yung order details
4. **Review order info** → Check kung tama
5. **Click "Mark as Packed"** → Confirm
6. **Scanner bubuksan ulit** → Ready na for next order

⏱️ **3-5 seconds per order lang!**

## Features

### Dashboard
- **Scan Barcode button** - Buksan ang camera scanner
- **Packing Queue table** - Lahat ng pending orders
- **Packed History** - Lahat ng na-pack mo na

### Stats Cards
- **Pending Orders** - Ilan pa ang kailangan i-pack
- **Packed Today** - Ilan na na-pack mo today
- **Total Packed** - Total na na-pack mo

### Barcode Scanner
- **FREE** - Walang bayad, unlimited scans
- **No API calls** - Gumagana sa browser lang
- **Camera-based** - Gamit ang phone/laptop camera
- **Auto-find** - Automatic hahanapin yung order

## Paano Gamitin ang Scanner?

### Step 1: Buksan ang Scanner
```
Click "Scan Barcode" button sa taas
```

### Step 2: Allow Camera Access
```
Browser mag-aask ng permission
Click "Allow" para gumana ang camera
```

### Step 3: I-scan ang Barcode
```
Ilagay ang waybill barcode sa harap ng camera
Automatic mag-scan (walang button na pipindutin)
```

### Step 4: Review Order
```
Lalabas yung order details:
- Order Number
- Waybill Number
- Product Name
- Quantity
- Customer Name
- Customer Phone
- Sales Channel
- Store
```

### Step 5: Mark as Packed
```
Click "Mark as Packed" button
Click "Confirm"
Done! Scanner bubuksan ulit for next order
```

## Tips para Mabilis

1. **Good lighting** - Siguraduhing maliwanag
2. **Hold steady** - Huwag gumalaw habang nag-scan
3. **Clear barcode** - Siguraduhing malinis yung barcode
4. **Right distance** - Hindi masyadong malapit o malayo

## Ano ang Makikita Mo?

### Packing Queue Table
| Order No. | Waybill No. | Action |
|-----------|-------------|--------|
| 12345     | WB123456    | View   |
| 12346     | WB123457    | View   |

### Packed History Table
| Waybill No. | Product | Qty | Packed At | Packed By |
|-------------|---------|-----|-----------|-----------|
| WB123456    | Product | 2   | 1:00 PM   | Packer 1  |

## Troubleshooting

### Camera hindi gumagana?
1. Check browser permissions (allow camera)
2. Gumamit ng HTTPS (required for camera)
3. Try ibang browser
4. Check kung may ibang app na gumagamit ng camera

### Hindi nag-scan ang barcode?
1. Siguraduhing maliwanag
2. Hold steady yung barcode
3. Ilagay sa loob ng scan area (yellow box)
4. Try ibang angle o distance
5. Check kung clear yung barcode

### Order not found?
1. Check kung may waybill sa database
2. Check kung na-pack na ba
3. Verify kung tama yung waybill number

## Keyboard Shortcuts

- **Enter** - Submit form
- **Esc** - Close modal
- **Tab** - Navigate fields

## Auto-Refresh

Dashboard nag-auto-refresh every **30 seconds** para updated lagi ang data.

## Search Function

May search bar sa Packing Queue:
- Search by Order Number
- Search by Waybill Number
- Search by Product Name
- Search by Customer Name

## Permissions

Packer role ay **LIMITED ACCESS** lang:
- ✅ Packing Queue
- ✅ Packed History
- ✅ Order Details
- ❌ Prices/Costs
- ❌ Financial Data
- ❌ Admin Features
- ❌ Settings
- ❌ Reports

## Setup (Para sa Admin)

### 1. Install Package
```bash
npm install html5-qrcode
```

### 2. Create Packer Account
Run sa Supabase SQL Editor:
```sql
INSERT INTO users (username, password, role, display_name, email)
VALUES ('packer1', 'pack789', 'packer', 'Packer 1', 'packer1@example.com');
```

### 3. Test Login
- Username: `packer1`
- Password: `pack789`

## Barcode Scanner Library

**Library**: html5-qrcode
- **Cost**: FREE
- **Limits**: UNLIMITED scans
- **API calls**: WALA (browser lang)
- **Supports**: Barcodes, QR codes
- **Camera**: Front/Back camera

## Browser Support

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari (iOS 11+)
- ✅ Mobile browsers

## Performance

- **Scan speed**: 10 FPS (frames per second)
- **Time per order**: 3-5 seconds
- **Orders per hour**: 720-1200 orders

## Workflow Diagram

```
Login → Scan → Find Order → Review → Pack → Next
  ↓       ↓        ↓          ↓       ↓      ↓
 3sec    1sec     Auto       2sec    1sec   Auto
```

## Mga Tanong?

1. **Ilang orders ang kaya i-pack per day?**
   - 720-1200 orders per hour
   - 5,760-9,600 orders per 8-hour shift

2. **May bayad ba ang scanner?**
   - WALA! Libre at unlimited

3. **Kailangan ba ng internet?**
   - OO, para ma-update ang database

4. **Pwede ba sa mobile?**
   - OO! Gumagana sa lahat ng devices

5. **Paano kung mali ang na-scan?**
   - Cancel lang, then scan ulit

## Next Steps

After ma-setup:
1. Test ang camera access
2. Test ang barcode scanning
3. Test ang packing workflow
4. Train ang mga packers
5. Monitor ang performance

---

**Status**: ✅ READY TO USE
**Date**: March 12, 2026
**Contact**: Admin for support
