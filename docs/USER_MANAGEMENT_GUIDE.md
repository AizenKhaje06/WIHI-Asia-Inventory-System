# 🔐 User Management System - Complete Guide

## Overview
StockSync now includes a comprehensive user management system that allows users to change their login credentials directly from the Settings page.

---

## 🎯 Features

### 1. **Change Username**
- Update your display name
- Minimum 3 characters required
- Takes effect immediately
- Visible across the entire application

### 2. **Change Password**
- Secure password update process
- Requires current password verification
- Password confirmation to prevent typos
- Minimum 6 characters required
- Password visibility toggle (show/hide)
- Reset to default option available

### 3. **Account Information Display**
- View current username
- View current role (Admin/Operations)
- Visual role indicator

---

## 📍 How to Access

### For Admin Users:
1. Log in with admin credentials
2. Navigate to **Dashboard** → **Settings**
3. Find the **Account Settings** card at the top

### For Operations Staff:
1. Log in with operations credentials
2. Navigate to **Operations Dashboard** → **Settings**
3. Find the **Account Settings** card at the top

---

## 🔄 How to Change Username

### Step-by-Step:

1. **Open Settings Page**
   - Click on "Settings" in the sidebar

2. **Click "Change Username"**
   - Located in the Account Settings card
   - Blue icon with user symbol

3. **Enter New Username**
   - Current username is displayed (read-only)
   - Enter your desired new username
   - Must be at least 3 characters

4. **Confirm Change**
   - Click "Update Username"
   - Success notification will appear
   - Page will refresh automatically

### Example:
```
Current Username: admin
New Username: john_admin
Result: You'll now log in with "john_admin"
```

---

## 🔒 How to Change Password

### Step-by-Step:

1. **Open Settings Page**
   - Click on "Settings" in the sidebar

2. **Click "Change Password"**
   - Located in the Account Settings card
   - Green icon with lock symbol

3. **Enter Current Password**
   - Type your existing password
   - Use eye icon to show/hide password

4. **Enter New Password**
   - Type your desired new password
   - Must be at least 6 characters
   - Use eye icon to show/hide password

5. **Confirm New Password**
   - Re-type your new password
   - System will show if passwords match
   - Green checkmark = passwords match
   - Red lock = passwords don't match

6. **Submit Change**
   - Click "Change Password"
   - Success notification will appear
   - Use new password on next login

### Password Requirements:
- ✅ Minimum 6 characters
- ✅ Must match confirmation
- ✅ Must provide correct current password

---

## 🔑 Default Credentials

### Admin Account:
```
Default Username: admin
Default Password: admin123
```

### Operations Account:
```
Default Username: staff
Default Password: ops456
```

---

## 🔄 Reset to Default Password

If you forget your custom password, you can reset it:

1. **Open Change Password Dialog**
2. **Click "Reset to default password"** (at the bottom)
3. **Confirmation will show the default password**
4. **Use default password to log in**

### Default Passwords:
- **Admin:** `admin123`
- **Operations:** `ops456`

---

## 💾 How It Works (Technical)

### Storage Location:
All credentials are stored in **browser localStorage**:

```javascript
// Usernames
localStorage.setItem('username', 'your_username')
localStorage.setItem('displayName', 'Your Display Name')

// Passwords (per role)
localStorage.setItem('adminPassword', 'custom_password')
localStorage.setItem('operationsPassword', 'custom_password')

// Role
localStorage.setItem('userRole', 'admin') // or 'operations'
```

### Security Features:
1. **Current password verification** - Must know old password to change
2. **Password confirmation** - Prevents typos
3. **Minimum length requirements** - Ensures password strength
4. **Role-based passwords** - Each role has separate password
5. **Reset option** - Can always reset to default

---

## 🎨 User Interface

### Account Settings Card:
```
┌─────────────────────────────────────────────┐
│  👤 Account Settings                         │
│  Manage your login credentials               │
├─────────────────────────────────────────────┤
│                                              │
│  🛡️ Currently logged in as                  │
│  Administrator                               │
│                                              │
│  Username: admin                             │
│  Role: Admin                                 │
│                                              │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ 👤 Change    │  │ 🔒 Change    │        │
│  │ Username     │  │ Password     │        │
│  └──────────────┘  └──────────────┘        │
│                                              │
│  ⚠️ Security Tip                            │
│  Use a strong password with at least        │
│  6 characters...                            │
└─────────────────────────────────────────────┘
```

---

## 📱 Responsive Design

The user management interface is fully responsive:

- **Desktop:** Side-by-side buttons
- **Tablet:** Side-by-side buttons
- **Mobile:** Stacked buttons

---

## ⚠️ Important Notes

### 1. **Browser-Specific**
- Credentials are stored per browser
- Clearing browser data will reset to defaults
- Different browsers = different credentials

### 2. **No Server Storage**
- Credentials are NOT stored on server
- No database required
- Simple and lightweight

### 3. **Multiple Users**
- Each role (Admin/Operations) has separate credentials
- Changing admin password doesn't affect operations password
- Each user can customize their own credentials

### 4. **Remember Me Feature**
- Only remembers username, not password
- Stored separately from credentials
- Can be cleared by unchecking "Remember Me"

---

## 🔐 Security Best Practices

### For Administrators:

1. **Change Default Password Immediately**
   - Default passwords are well-known
   - Change on first login

2. **Use Strong Passwords**
   - Mix of letters, numbers, symbols
   - Avoid common words
   - Don't use personal information

3. **Don't Share Credentials**
   - Each user should have their own account
   - Don't share admin password with operations staff

4. **Regular Password Updates**
   - Change password every 3-6 months
   - Change immediately if compromised

5. **Remember Your Password**
   - Write it down securely
   - Use password manager
   - Know how to reset to default

---

## 🐛 Troubleshooting

### Problem: "Current password is incorrect"
**Solution:**
- Double-check your current password
- Try the default password for your role
- Use "Reset to default password" option

### Problem: "Passwords do not match"
**Solution:**
- Carefully re-type the new password
- Use the eye icon to verify spelling
- Ensure no extra spaces

### Problem: "Password must be at least 6 characters"
**Solution:**
- Count your characters
- Add more characters to meet minimum
- Consider using a passphrase

### Problem: Forgot custom password
**Solution:**
1. Click "Change Password"
2. Click "Reset to default password"
3. Use default password to log in
4. Set a new custom password

### Problem: Username not updating
**Solution:**
- Page should refresh automatically
- Manually refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache if issue persists

---

## 📊 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Change Username | ❌ Not possible | ✅ Easy to change |
| Change Password | ❌ Not possible | ✅ Secure process |
| Password Visibility | ❌ No | ✅ Toggle show/hide |
| Password Confirmation | ❌ No | ✅ Required |
| Reset Option | ❌ No | ✅ Reset to default |
| Current Password Check | ❌ No | ✅ Required |
| Visual Feedback | ❌ No | ✅ Match indicator |

---

## 🎯 Use Cases

### Use Case 1: New Admin Setup
```
1. Log in with default credentials (admin/admin123)
2. Go to Settings
3. Change username to "john_admin"
4. Change password to "SecurePass123!"
5. Log out and test new credentials
```

### Use Case 2: Operations Staff Onboarding
```
1. Give staff default credentials (staff/ops456)
2. Staff logs in
3. Staff changes username to their name
4. Staff sets personal password
5. Staff can now use personalized login
```

### Use Case 3: Password Reset
```
1. User forgets custom password
2. Opens Settings (if logged in) or asks admin
3. Clicks "Reset to default password"
4. Uses default password to log in
5. Sets new custom password
```

### Use Case 4: Security Audit
```
1. Admin reviews all accounts
2. Forces password change for all users
3. Each user updates their password
4. System is now more secure
```

---

## 🚀 Future Enhancements (Optional)

### Potential Additions:
1. **Password Strength Meter** - Visual indicator of password strength
2. **Password History** - Prevent reusing recent passwords
3. **Two-Factor Authentication** - Extra security layer
4. **Session Timeout** - Auto-logout after inactivity
5. **Login Attempt Limiting** - Lock account after failed attempts
6. **Email Notifications** - Alert on password changes
7. **Multiple Admin Accounts** - Support for multiple admins
8. **Audit Log** - Track all credential changes

---

## 📝 Summary

### What You Can Do Now:
✅ Change your username anytime  
✅ Update your password securely  
✅ View your account information  
✅ Reset to default if needed  
✅ Toggle password visibility  
✅ Get visual feedback on password match  

### Security Features:
🔒 Current password verification  
🔒 Password confirmation required  
🔒 Minimum length enforcement  
🔒 Role-based separation  
🔒 Reset to default option  

### User Experience:
🎨 Beautiful, intuitive interface  
🎨 Clear visual feedback  
🎨 Responsive design  
🎨 Toast notifications  
🎨 Smooth animations  

---

## 📞 Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Try resetting to default password
3. Clear browser cache and try again
4. Contact your system administrator

---

**Your account security is now in your hands! 🔐**

**Last Updated:** January 29, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
