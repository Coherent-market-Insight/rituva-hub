# 📖 How to Use Signup - Step by Step Guide

## ✅ FIXED! Toast Notifications Now Show

The signup was working, but you couldn't see messages. **This is now fixed!**

---

## 🎯 Step-by-Step Signup Instructions

### **Step 1: Go to Signup Page**
```
http://localhost:3000/auth/signup
```

---

### **Step 2: Fill the Form**

Fill in these fields:

| Field | Example | Rules |
|-------|---------|-------|
| **Full Name** | Aditya Jha | Any name (required) |
| **Email** | aditya@example.com | Valid email (required) |
| **Password** | password123 | Min 6 characters |
| **Confirm Password** | password123 | Must match password |

---

### **Step 3: Click "Sign up" Button**

When you click the button:
- ✅ You'll see a **green notification** saying "Verification code sent to your email!"
- ✅ The form will **change** to show OTP verification field
- ✅ **Check your terminal** for the OTP code

---

### **Step 4: Get Your OTP Code**

Look in your terminal for this message:

```
📧 OTP EMAIL SENT

To: aditya@example.com
OTP Code: 123456
Valid for 10 minutes
```

**Copy the 6-digit code** (example: 123456)

---

### **Step 5: Enter OTP Code**

In the form, you'll see:
```
We've sent a 6-digit verification code to: aditya@example.com

Verification Code: [______]
Code expires in 10 minutes
```

**Enter the 6-digit code** from your terminal

---

### **Step 6: Click "Verify Email" Button**

When you click:
- ✅ The code will be verified
- ✅ You'll see **green notification**: "Email verified! Redirecting to dashboard..."
- ✅ You'll be **automatically logged in**
- ✅ **Redirected to dashboard** 🎉

---

## 🔍 What You'll See (Notifications)

### ✅ Success Messages (Green)
```
✓ Verification code sent to your email!
✓ Email verified! Redirecting to dashboard...
```

### ❌ Error Messages (Red)
```
✗ Please enter your full name
✗ Password must be at least 6 characters
✗ Passwords do not match
✗ Email already registered
✗ Invalid or expired verification code
```

---

## ⏰ OTP Features

| Feature | Details |
|---------|---------|
| **Duration** | 10 minutes |
| **Format** | 6 digits (e.g., 123456) |
| **One-time use** | Once verified, code becomes invalid |
| **Resend** | Click "Resend in 60s" (after 60 seconds) |
| **Go back** | Click "Back to signup" to restart |

---

## 🎮 Complete Example

### **Your inputs:**
```
Full Name:       Aditya Jha
Email:           aditya@example.com
Password:        mypassword123
Confirm Pass:    mypassword123
```

### **You click "Sign up"**

✅ **Message appears (green):**
```
Verification code sent to your email!
```

### **Form changes to OTP screen**

```
We've sent a 6-digit verification code to:
aditya@example.com

Verification Code: [______]
Code expires in 10 minutes

[Verify Email button]
─────────────────
Didn't receive the code?
[Resend in 60s button]
[Back to signup link]
```

### **Check terminal and find:**
```
📧 OTP EMAIL SENT

To: aditya@example.com
OTP Code: 123456
Valid for 10 minutes
```

### **You enter OTP in form:**
```
Verification Code: [123456]
```

### **You click "Verify Email"**

✅ **Message appears (green):**
```
Email verified! Redirecting to dashboard...
```

### **You're redirected to dashboard** 🎉

```
Welcome to Project Hub!
```

---

## 🆘 Common Issues & Fixes

### **Issue: Nothing happens when I click "Sign up"**

**Check:**
1. ✅ Is Full Name filled in? (required)
2. ✅ Is Email filled in? (required)
3. ✅ Is Password at least 6 characters?
4. ✅ Do passwords match?

If all filled, you should see a notification.

---

### **Issue: I see an error message**

**Error Messages:**
```
"Please enter your full name"
→ Fill in Full Name field

"Password must be at least 6 characters"
→ Make password longer (min 6)

"Passwords do not match"
→ Confirm password doesn't match password

"Email already registered"
→ Use a different email address
```

---

### **Issue: I can't find the OTP code**

**Where to look:**
1. **Terminal/Console window** where you ran `npm run dev`
2. Search for: `📧 OTP EMAIL SENT`
3. Copy the 6-digit code below it

Example:
```
📧 OTP EMAIL SENT

To: your-email@example.com
OTP Code: 123456  ← COPY THIS
Valid for 10 minutes
```

---

### **Issue: OTP code doesn't work**

**Reasons:**
- ❌ Code expired (10 minute limit)
- ❌ Copied wrong digits
- ❌ Already used
- ❌ Wrong email

**Solution:**
- Click "Resend in 60s" button
- Wait 60 seconds
- Click it when available
- New code will appear in terminal
- Try again

---

### **Issue: I got "Email already registered"**

**Cause:** You already signed up with this email

**Solution:**
- Click "Back to signup"
- Try with different email
- Example: `aditya2@example.com`

---

## 🚀 Quick Test (2 Minutes)

```
1. Go to: http://localhost:3000/auth/signup
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: test1234
   - Confirm: test1234
3. Click: "Sign up"
4. See: Green notification
5. Form changes
6. Check terminal for OTP
7. Copy 6-digit code
8. Paste into form
9. Click: "Verify Email"
10. See: Green notification
11. Redirected to dashboard ✅
```

---

## 📸 Form Fields Explained

### **Full Name**
- Used to identify you
- Required field
- Any text is fine

### **Email**
- Used for login & verification
- Must be unique (can't sign up twice with same email)
- Required field

### **Password**
- Min 6 characters
- Used for login
- Stored securely (hashed)
- Required field

### **Confirm Password**
- Must exactly match Password
- Double-check before signing up
- Required field

---

## ✨ After Verification

Once you verify your email:
- ✅ You're logged in
- ✅ JWT token created (30-day expiry)
- ✅ Redirected to dashboard
- ✅ Can access all features

---

## 🔐 Security Notes

- ✅ Password is hashed (not stored in plain text)
- ✅ OTP expires in 10 minutes
- ✅ OTP is one-time use only
- ✅ Email verification required
- ✅ JWT tokens are secure

---

## 💡 Pro Tips

1. **Check notifications** - Green = success, Red = error
2. **Look at terminal** - OTP code appears in console
3. **Copy exactly** - Make sure 6 digits are correct
4. **Resend if needed** - Wait 60 seconds then resend
5. **Clear inputs** - Use "Back to signup" to try again

---

## 🎯 Summary

| Step | Action | You'll See |
|------|--------|-----------|
| 1 | Fill form | Form with inputs |
| 2 | Click "Sign up" | Green notification |
| 3 | Check terminal | OTP code: 123456 |
| 4 | Enter code | OTP verification form |
| 5 | Click "Verify Email" | Green notification |
| 6 | Redirected | Dashboard page |

---

## 📞 Still Not Working?

**Try these:**
1. ✅ Refresh page: F5
2. ✅ Clear browser cache: Ctrl+Shift+Delete
3. ✅ Restart server: Stop and run `npm run dev`
4. ✅ Check terminal for errors
5. ✅ Make sure all fields are filled

---

**🎉 You're ready! Start signing up now!**

Visit: **http://localhost:3000/auth/signup**


