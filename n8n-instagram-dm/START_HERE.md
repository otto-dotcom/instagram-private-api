# 🚀 START HERE - Instagram DM Automation

## ⚡ Get Running in 3 Steps

### Step 1: Install & Setup
```bash
cd n8n-instagram-dm
npm install
cp .env.example .env
```

### Step 2: Configure (Optional)
Edit `.env` if needed:
```env
PORT=3000
API_KEY=your-secret-key  # Optional, leave empty for dev
SESSION_TTL_HOURS=24
```

### Step 3: Start & Open
```bash
npm run build
npm start
```

Then open your browser to:
```
http://localhost:3000
```

**That's it! 🎉**

---

## 🌐 Web Interface Quick Tour

When you open `http://localhost:3000`, you'll see:

### 📱 Header
- Instagram logo + title
- Server status indicator (🟢 Online / 🔴 Offline)

### 🎯 Four Main Tabs

#### 1️⃣ Single DM Tab
**Use for:** Sending one DM at a time

**You need:**
- Your Instagram username & password
- Recipient's username (no @ symbol)
- Your message

**Steps:**
1. Fill in the form
2. Click "Send DM"
3. See results + get session ID
4. Reuse session ID for faster sends!

---

#### 2️⃣ Bulk DMs Tab
**Use for:** Sending personalized DMs to many people

**You need:**
- Your Instagram credentials
- List of recipients + messages (JSON or CSV)

**JSON Example:**
```json
[
  {"username": "john", "message": "Hi John!"},
  {"username": "jane", "message": "Hey Jane!"}
]
```

**CSV Example:**
```csv
username,message
john,"Hi John!"
jane,"Hey Jane!"
```

**Steps:**
1. Choose JSON or CSV format
2. Paste your data
3. Set delay (5000-10000ms recommended)
4. Click "Send Bulk DMs"
5. Watch results come in!

---

#### 3️⃣ Sessions Tab
**Use for:** Managing your Instagram login sessions

**What you see:**
- All active sessions
- Username and expiration time
- Active/Expired status

**What you can do:**
- 📋 Copy session ID (for reuse)
- 🗑️ Delete session
- 🔄 Refresh list

**Why it matters:**
- Sessions last 24 hours
- Reusing = faster + safer
- No repeated logins = less suspicious

---

#### 4️⃣ Settings Tab
**Use for:** Configuration and tips

**Configure:**
- API Server URL (if different from default)
- API Key (if your server requires it)

**Learn:**
- Best practices
- Security tips
- Rate limiting advice
- Link to full documentation

---

## 💡 Common Scenarios

### Scenario 1: "I want to test with one DM"
1. Go to **Single DM** tab
2. Enter your Instagram login
3. Put your own username as recipient
4. Write "Test message"
5. Click Send
6. Check your Instagram!

### Scenario 2: "I have 10 leads from Airtable"
1. Export to CSV with columns: `username,message`
2. Go to **Bulk DMs** tab
3. Click CSV format button
4. Paste your CSV data
5. Set delay to 7000ms
6. Send!

### Scenario 3: "I want to send faster"
1. Send your first DM (any tab)
2. Copy the session ID from results
3. Go to **Sessions** tab to verify it's active
4. Next time, paste session ID in the form
5. Skip login = much faster!

---

## 🎨 What It Looks Like

### Color Scheme
- Instagram-inspired purple/pink gradient
- Clean white cards
- Modern, minimal design

### Layout
- Top: Header with logo and status
- Below: Tab navigation (blue gradient when active)
- Main: White card with form/content
- Bottom: Results (green for success, red for errors)

### Responsive
- Works on desktop, tablet, and mobile
- Touch-friendly buttons
- Readable on all screen sizes

---

## 🔐 Security Notes

### Your Credentials
- Sent directly to server (not stored in browser)
- Use HTTPS in production
- Consider using dedicated Instagram account

### Session IDs
- Saved in browser localStorage for convenience
- Can be copied and reused
- Expire after 24 hours
- Delete when done for extra security

### API Keys
- Optional (leave empty for dev)
- Set in .env file on server
- Enter in Settings tab in web app
- Stored locally in browser

---

## 📊 Understanding Results

### ✅ Success (Green Box)
```
✓ DM Sent Successfully!
{
  "success": true,
  "recipient": "john_doe",
  "threadId": "340282366841...",
  "sessionId": "a1b2c3d4..."  ← Save this!
}
```

### ❌ Error (Red Box)
```
✗ Failed to Send DM
{
  "error": "User not found: john_doe"
}
```

### 📊 Bulk Results (Table)
| # | Recipient | Status | Details |
|---|-----------|--------|---------|
| 1 | john_doe  | ✓ Sent | Thread: 340... |
| 2 | jane_doe  | ✗ Failed | User not found |

**Stats shown:**
- Total: 2
- Successful: 1
- Failed: 1
- Success Rate: 50%

---

## ⚠️ Common Issues

### "Server shows offline"
**Fix:** Make sure server is running
```bash
npm start
```

### "Invalid API key"
**Fix:** Check Settings tab, enter correct key, or disable in .env

### "Two-factor authentication required"
**Fix:** Disable 2FA on Instagram account, or use account without 2FA

### "User not found"
**Fix:** Check username spelling (no @ symbol needed)

### Session expired
**Fix:** Normal after 24 hours, just send without session ID

---

## 🚀 Next Steps

### For Manual Use
- Use the web interface for all your DM campaigns
- Save session IDs for batch campaigns
- Export leads to CSV from Airtable/Sheets
- Paste and send!

### For n8n Integration
- Use the REST API endpoints
- See [README.md](./README.md) for API docs
- Import [n8n-workflow-example.json](./n8n-workflow-example.json)
- Connect to your AI agent

### For Developers
- API documentation in README.md
- Extend the web app (public/*.js)
- Add custom features
- Deploy to production

---

## 📚 Documentation

- **README.md** - Full API documentation
- **WEB_APP_GUIDE.md** - Detailed web app guide
- **QUICKSTART.md** - 5-minute setup guide
- **START_HERE.md** - You are here! 👋

---

## 🎯 Best Practices

1. **Start Small**
   - Test with 5-10 DMs first
   - Warm up new accounts gradually

2. **Use Delays**
   - 5000-10000ms between messages
   - Instagram watches for spam patterns

3. **Personalize**
   - Use AI to customize messages
   - Better engagement + less spam flags

4. **Monitor Sessions**
   - Check Sessions tab regularly
   - Delete expired ones
   - Reuse active ones

5. **Stay Safe**
   - Max 50-100 DMs per day
   - Don't send identical messages
   - Take breaks between campaigns

---

## ✨ Features at a Glance

| Feature | Single DM | Bulk DMs | Sessions |
|---------|-----------|----------|----------|
| Send one DM | ✅ | | |
| Send many DMs | | ✅ | |
| CSV import | | ✅ | |
| JSON import | | ✅ | |
| Session reuse | ✅ | ✅ | |
| Session management | | | ✅ |
| Copy session ID | | | ✅ |
| Progress tracking | ✅ | ✅ | |
| Error details | ✅ | ✅ | |

---

## 🤝 Need Help?

1. Check [WEB_APP_GUIDE.md](./WEB_APP_GUIDE.md) for detailed instructions
2. Check [README.md](./README.md) for API details
3. Look at browser console for errors (F12)
4. Check server logs in terminal

---

**Ready to automate? Open http://localhost:3000 and start sending! 🚀**
