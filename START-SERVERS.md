# Starting Your Secret Santa Servers

To run the full Secret Santa application with email functionality, you need to start 3 services:

## 🚀 Quick Start (All Services)

Open **3 terminal windows** and run:

### Terminal 1: Supabase
```bash
cd /Users/michaelreoch/secret-santa
supabase start
```
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323

### Terminal 2: Web Server
```bash
cd /Users/michaelreoch/secret-santa
python3 -m http.server 8000
```
- **Website**: http://localhost:8000

### Terminal 3: Email Proxy
```bash
cd /Users/michaelreoch/secret-santa
source venv/bin/activate
python3 email-proxy.py
```
- **Email Proxy**: http://localhost:5001
- **Purpose**: Forwards emails to Resend API (avoids CORS)
- **Note**: Port 5000 is used by macOS AirPlay, so we use 5001

---

## ✅ When All Running:

Visit: **http://localhost:8000**

You can now:
- ✅ Sign up / Sign in
- ✅ Create/join groups
- ✅ **Send real email invitations** 📧
- ✅ Draw names
- ✅ See assignments

---

## 🛑 Stopping Servers

Press `Ctrl+C` in each terminal window to stop the servers.

---

## 🎯 Why Three Services?

1. **Supabase** - Database and authentication
2. **Web Server** - Serves your HTML/CSS/JS files  
3. **Email Proxy** - Handles Resend API calls (CORS workaround)

---

## 🔍 Check if Services are Running

```bash
# Check Supabase
curl http://127.0.0.1:54321/health

# Check Web Server
curl http://localhost:8000

# Check Email Proxy
curl http://localhost:5001/health
```

All should respond successfully!

---

## 📧 Email Proxy Details

**Why do we need it?**
- Resend API blocks direct browser calls (CORS security)
- Proxy server forwards requests server-side
- Keeps API key secure

**What it does:**
```
Browser → Email Proxy (localhost:5001) → Resend API → Email Sent! ✅
```

**Port 5001** is used (5000 is taken by macOS AirPlay)

---

## 🎄 Ready to Use!

Once all three servers are running, your Secret Santa platform is fully operational with real email sending! 🎅📧

