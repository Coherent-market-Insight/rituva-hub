# 🎯 Quick Reference - Email OTP Signup

## ✅ Status: LIVE & WORKING

Server: http://localhost:3000 ✅  
Signup: http://localhost:3000/auth/signup ✅

---

## 🚀 How to Test (30 Seconds)

```
1. Go to: http://localhost:3000/auth/signup
2. Fill form:
   - Name: John Doe
   - Email: john@test.com
   - Password: test1234
   - Confirm: test1234
3. Click: "Sign up"
4. Check terminal for OTP code
5. Enter code in form
6. Click: "Verify Email"
7. You're logged in! ✅
```

---

## 📧 OTP Code Location

When you click "Sign up", the terminal will show:

```
📧 OTP EMAIL SENT

To: john@test.com
OTP Code: 123456
Valid for 10 minutes
```

Copy the 6-digit code and enter it in the form.

---

## 🔑 API Endpoints

### Signup
```bash
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

### Verify OTP
```bash
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Resend OTP
```bash
POST /api/auth/resend-otp
{
  "email": "user@example.com"
}
```

---

## 🔒 OTP Features

- ✅ 6-digit code
- ✅ 10-minute expiry
- ✅ One-time use
- ✅ 60-second resend timer
- ✅ Auto-login after verify
- ✅ Go back option

---

## 📁 Key Files

```
lib/otp.ts                           OTP logic
app/api/auth/signup/route.ts         Signup endpoint
app/api/auth/verify-otp/route.ts     OTP verification
app/api/auth/resend-otp/route.ts     Resend OTP
app/auth/signup/page.tsx             Signup UI
```

---

## 📚 Full Documentation

- `OTP_EMAIL_VERIFICATION.md` - Complete guide
- `SIGNUP_OTP_COMPLETE.md` - Full feature details

---

## 💡 Common Issues

| Issue | Solution |
|-------|----------|
| Not seeing OTP | Check terminal window |
| Code not working | Must be 6-digit code from terminal |
| Already exists | Use different email |
| Code expired | Wait 10 min or click Resend |
| Server down | Run: `npm run dev` |

---

## 🎉 You're Set!

Visit http://localhost:3000/auth/signup and test it now!

