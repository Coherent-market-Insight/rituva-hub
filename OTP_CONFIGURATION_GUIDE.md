# 🔧 OTP Configuration & Troubleshooting Guide

## ✅ OTP System is Now Ready!

The issue was fixed. Your OTP system should now work properly.

---

## 🎯 How OTP Works (Behind the Scenes)

### **The Flow:**

1. **User fills signup form** → Click "Sign up"
2. **Backend creates user** + generates 6-digit OTP
3. **OTP saved to database** (table: `otps`)
4. **OTP sent** (currently logs to console)
5. **User receives code** in terminal
6. **User enters code** → System verifies
7. **Email marked as verified** → User logged in

---

## 📊 Database Setup

### **OTP Table Schema:**
```sql
CREATE TABLE otps (
  id        TEXT PRIMARY KEY,
  email     TEXT NOT NULL,
  code      TEXT NOT NULL,        -- 6-digit code
  purpose   TEXT DEFAULT 'signup',
  is_used   BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW(),
  expires_at DATETIME NOT NULL     -- 10 minutes from creation
);
```

**Status:** ✅ Table exists in database

---

## 🚀 How to Use OTP System

### **Development Mode (Current)**

OTP codes are **printed to terminal**. No external service needed.

**Steps:**
1. Go to: http://localhost:3000/auth/signup
2. Fill form completely
3. Click "Sign up"
4. **Look in terminal for:**
   ```
   📧 OTP EMAIL SENT
   To: your-email@example.com
   OTP Code: 123456
   Valid for 10 minutes
   ```
5. Copy the 6-digit code
6. Paste into form
7. Click "Verify Email"
8. You're logged in! ✅

---

## 🔑 Configuration Options

### **Option 1: Keep Development Mode (Default)**

- ✅ OTP printed to terminal
- ✅ No configuration needed
- ✅ Perfect for testing
- ✅ No external API keys

**Already configured!** Just use it.

---

### **Option 2: Add Real Email Service (Resend)**

For production, integrate actual email sending.

#### **Step 1: Create Resend Account**
```
1. Go to: https://resend.com
2. Sign up (free)
3. Get API key
```

#### **Step 2: Install Resend**
```bash
npm install resend
```

#### **Step 3: Add Environment Variable**
In `.env.local`:
```
RESEND_API_KEY=re_your_key_here
```

#### **Step 4: Update OTP Service**
Edit `lib/otp.ts`:

Replace this:
```typescript
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    console.log(`\n📧 OTP EMAIL SENT\n`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for 10 minutes\n`);
    return true;
  } catch (error) {
    console.error('[EMAIL_ERROR]', error);
    return false;
  }
}
```

With this:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // Log for debugging
    console.log(`\n📧 OTP EMAIL SENT\n`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for 10 minutes\n`);

    // Send actual email
    const response = await resend.emails.send({
      from: 'noreply@projecthub.app',
      to: email,
      subject: 'Project Hub - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Welcome to Project Hub! Please verify your email to complete signup.</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; margin: 0; color: #000;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't sign up, you can ignore this email.</p>
        </div>
      `,
    });

    return !!response;
  } catch (error) {
    console.error('[EMAIL_ERROR]', error);
    return false;
  }
}
```

#### **Step 5: Restart Server**
```bash
npm run dev
```

**Now emails will be sent via Resend!** ✅

---

### **Option 3: SendGrid Integration**

```bash
npm install @sendgrid/mail
```

In `lib/otp.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    console.log(`\n📧 OTP EMAIL SENT\n`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for 10 minutes\n`);

    await sgMail.send({
      to: email,
      from: 'noreply@projecthub.app',
      subject: 'Project Hub - Verify Your Email',
      html: `
        <h2>Verify Your Email</h2>
        <p>Your verification code:</p>
        <h1 style="letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('[EMAIL_ERROR]', error);
    return false;
  }
}
```

Add to `.env.local`:
```
SENDGRID_API_KEY=SG.your_key_here
```

---

## 🧪 Test OTP System

### **Manual Test:**

1. Go to: http://localhost:3000/auth/signup
2. Fill form:
   ```
   Name: Test User
   Email: test@example.com
   Password: test1234
   Confirm: test1234
   ```
3. Click "Sign up"
4. **Check terminal** for OTP code
5. Enter code in form
6. Click "Verify Email"
7. ✅ You should be logged in!

### **Database Test:**

Check if OTP was saved:
```bash
npm run db:studio
# Opens: http://localhost:5555
# Look at: otps table
```

---

## 🐛 Troubleshooting

### **Problem: OTP not appearing in terminal**

**Check:**
1. ✅ Terminal window still open?
2. ✅ Did you scroll up?
3. ✅ Did form submit successfully?
4. ✅ Any error messages?

**Solution:**
1. Look for red error notification on page
2. Check browser console (F12)
3. Check server terminal for errors
4. Try refreshing page

---

### **Problem: Database error when creating OTP**

**Check:**
1. ✅ OTP table exists: `npm run db:studio`
2. ✅ Database connection working
3. ✅ Prisma client generated

**Solution:**
```bash
# Regenerate Prisma Client
npm run db:generate

# Reinitialize database
npm run db:push

# Restart server
npm run dev
```

---

### **Problem: OTP verification fails**

**Reasons:**
- Code expired (10 minute limit)
- Code already used
- Wrong code entered
- Database not saving OTP

**Solution:**
1. Click "Resend in 60s" for new code
2. Copy code from terminal exactly
3. Enter all 6 digits
4. Check database if it's saved

---

## 📋 OTP Lifecycle

| Event | Status | Duration |
|-------|--------|----------|
| OTP created | `is_used: false` | - |
| OTP valid | Expires in 10 min | 10 minutes |
| OTP verified | `is_used: true` | Permanent |
| OTP expired | Invalid | - |
| OTP cleaned | Deleted | - |

---

## 🔒 Security Features

✅ **6-digit code** - Hard to guess  
✅ **10-minute expiry** - Prevents brute force  
✅ **One-time use** - Can't reuse  
✅ **Database storage** - Secure  
✅ **Encrypted in transit** - HTTPS ready  

---

## 🚀 Production Deployment

### **For Vercel:**

1. **Switch email service** (Resend recommended)
2. **Add API key** to Vercel environment
3. **Update OTP function** in `lib/otp.ts`
4. **Deploy to Vercel**

### **Environment Variables (Vercel):**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=xxxxx
```

---

## 📞 Quick Reference

### **Current Status:**
- ✅ OTP table: Exists
- ✅ OTP generation: Working
- ✅ OTP logging: To terminal (dev mode)
- ✅ Database: Connected
- ✅ Toast notifications: Showing

### **To Test Now:**
```
1. http://localhost:3000/auth/signup
2. Fill & submit form
3. Check terminal for: "📧 OTP EMAIL SENT"
4. Copy code, enter, verify
5. Done! ✅
```

### **To Add Real Email:**
```
1. npm install resend
2. Create account at resend.com
3. Get API key
4. Add to .env.local
5. Update lib/otp.ts
6. Restart: npm run dev
```

---

## ✨ Summary

**OTP System Status:** ✅ **WORKING**

**Current Mode:** Development (terminal logging)

**What Works:**
- ✅ OTP generation
- ✅ OTP saving to database
- ✅ OTP logging to terminal
- ✅ OTP verification
- ✅ Expiry management

**To Use:**
1. Signup form → Submit
2. Check terminal for code
3. Enter code → Verify
4. Logged in! ✅

**To Add Email Service:**
- Follow instructions above
- Use Resend (easiest)
- Restart server
- Works on production! 🚀

---

**Ready to test?** Go to http://localhost:3000/auth/signup now! 🎉

