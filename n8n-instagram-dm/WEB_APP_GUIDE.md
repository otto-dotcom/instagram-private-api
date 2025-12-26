# Web App User Guide

The Instagram DM Automation service includes a beautiful, user-friendly web interface for managing your DM campaigns without needing to use curl or n8n.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open your browser:**
   ```
   http://localhost:3000
   ```

3. **Start sending DMs!**

## 📱 Features

### 1. Single DM Tab
Send personalized DMs to individual recipients.

**Fields:**
- **Your Instagram Username** - The account you're sending from
- **Your Instagram Password** - Your account password
- **Recipient Username** - Target Instagram username (without @)
- **Message** - Your personalized message (up to 1000 characters)
- **Session ID** (Optional) - Reuse from previous sends for faster delivery

**Tips:**
- The session ID is automatically filled in after your first send
- Character counter helps you stay within limits
- Messages support emojis and line breaks

### 2. Bulk DMs Tab
Send customized messages to multiple recipients at once.

**Features:**
- **JSON or CSV format** - Choose your preferred data format
- **Configurable delay** - Set delay between messages (5000-10000ms recommended)
- **Progress tracking** - See results for each recipient
- **Success/failure stats** - Track your campaign performance

**JSON Format Example:**
```json
[
  {"username": "john_doe", "message": "Hi John! Great content!"},
  {"username": "jane_smith", "message": "Hey Jane! Love your work!"}
]
```

**CSV Format Example:**
```csv
username,message
john_doe,"Hi John! Great content!"
jane_smith,"Hey Jane! Love your work!"
```

### 3. Sessions Tab
Manage your active Instagram authentication sessions.

**Features:**
- View all active sessions
- See expiration times
- Copy session IDs for reuse
- Delete expired sessions
- Refresh session list

**Session Benefits:**
- Avoid repeated Instagram logins
- Faster message delivery
- Reduced risk of security checks
- 24-hour session lifetime (configurable)

### 4. Settings Tab
Configure your API connection.

**Configuration:**
- **API Server URL** - Server endpoint (default: http://localhost:3000)
- **API Key** - Optional authentication (if enabled on server)

**Quick Tips Section:**
- Best practices for Instagram automation
- Security recommendations
- Rate limiting guidance

## 🎨 Interface Tour

### Header
- **Instagram Logo** - Instant brand recognition
- **Online Status** - Real-time server connection indicator
  - 🟢 Green = Server online
  - 🔴 Red = Server offline

### Navigation Tabs
Clean, modern tab interface for easy navigation between features.

### Forms
- **Auto-validation** - Required fields are marked
- **Helper text** - Tips and examples for each field
- **Character counters** - Track message length
- **Format toggles** - Switch between JSON/CSV easily

### Results Display
- **Success messages** - Green with ✓ icon
- **Error messages** - Red with ✗ icon
- **Detailed data** - JSON formatted for debugging
- **Bulk results table** - Per-recipient status tracking

## 💡 Common Use Cases

### Use Case 1: Quick Single DM
1. Go to **Single DM** tab
2. Enter your credentials
3. Add recipient username
4. Write your message
5. Click **Send DM**
6. Save the session ID for next time!

### Use Case 2: Daily Outreach Campaign
1. Prepare your recipient list in CSV/JSON
2. Go to **Bulk DMs** tab
3. Enter credentials (or reuse session ID)
4. Paste your data
5. Set delay to 7000ms
6. Click **Send Bulk DMs**
7. Monitor results in real-time

### Use Case 3: Session Management
1. Send your first DM (creates session)
2. Go to **Sessions** tab
3. Find your session
4. Click 📋 to copy session ID
5. Use this ID in future sends (much faster!)

## 🔐 Security

### Credentials Storage
- All credentials are sent directly to the server
- Nothing is stored in your browser
- Session IDs are saved in localStorage for convenience
- Clear browser data to remove saved settings

### API Key Protection
If your server has an API key enabled:
1. Go to **Settings** tab
2. Enter your API key
3. Click **Save Settings**
4. Key is stored locally for future requests

### Best Practices
- Use a dedicated Instagram account for automation
- Don't share your session IDs
- Clear sessions when done
- Keep your API key secret
- Use HTTPS in production

## 🎯 Workflow Integration

### With AI Lead Gen
1. Export leads from Airtable/Supabase
2. Use AI to generate personalized messages
3. Create CSV/JSON with username + message
4. Paste into **Bulk DMs** tab
5. Send with appropriate delay
6. Track results

### Example Workflow
```
Airtable (Get Leads)
    ↓
OpenAI (Generate Messages)
    ↓
CSV Export
    ↓
Web App (Bulk DMs) ← You are here!
    ↓
Airtable (Update Status)
```

## 🐛 Troubleshooting

### Server Shows Offline
- Check if server is running (`npm start`)
- Verify URL in Settings tab
- Check browser console for errors

### "Invalid API Key" Error
- Go to Settings tab
- Enter correct API key
- Click Save Settings
- Try request again

### Session Expired
- Normal after 24 hours
- Just send without session ID
- New session will be created
- Save new session ID for reuse

### DM Failed to Send
**Common reasons:**
- Incorrect recipient username
- Account has 2FA enabled
- Instagram checkpoint required
- Rate limit exceeded
- Recipient blocked you

**Solutions:**
- Verify username is correct
- Disable 2FA on sending account
- Login via Instagram app to clear checkpoint
- Increase delay between messages
- Check if account is accessible

### Bulk Send Partially Failed
- Review the results table
- Failed recipients show error details
- Successful ones have thread IDs
- Retry failed recipients individually

## 📊 Understanding Results

### Single DM Success Response
```json
{
  "success": true,
  "recipient": "john_doe",
  "message": "Hi John!",
  "threadId": "340282366841...",
  "itemId": "29260188881...",
  "timestamp": "2024-01-15T10:30:00Z",
  "sessionId": "a1b2c3d4..."
}
```

**Key Fields:**
- `threadId` - Instagram conversation ID
- `itemId` - Message ID
- `sessionId` - Save this for next send!

### Bulk Results
Shows table with:
- Recipient number (#1, #2, etc.)
- Username
- Status (✓ Sent or ✗ Failed)
- Details (Thread ID or error message)

### Success Rate
Displayed at top of bulk results:
- Total messages attempted
- Successful sends
- Failed sends
- Success rate percentage

## 🚀 Performance Tips

### Faster Sending
- Reuse session IDs
- Keep sessions tab open to monitor
- Use same account for multiple campaigns

### Better Deliverability
- Warm up new accounts slowly
- Start with 10-20 DMs/day
- Increase gradually over 2 weeks
- Use 5-10 second delays
- Personalize each message

### Avoid Detection
- Don't send too many too fast
- Vary your messages (use AI)
- Send during business hours
- Take breaks between campaigns
- Monitor for Instagram warnings

## 🎨 Browser Support

Fully tested and supported on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

Requires:
- JavaScript enabled
- localStorage enabled
- Modern CSS support

## 📱 Mobile Usage

The web app is fully responsive!

**Mobile Features:**
- Touch-optimized buttons
- Responsive forms
- Readable on small screens
- Works on tablets too

**Recommended:**
Use on tablet or desktop for bulk operations. Mobile is great for quick single DMs.

## 🎯 Pro Tips

1. **Save Session IDs** - Copy to notes app for later
2. **Test First** - Send to your own account first
3. **Monitor Sessions** - Check expiration times
4. **Use Delays** - 7000-10000ms is safest
5. **Personalize** - Use AI to customize each message
6. **Track Results** - Note thread IDs for follow-ups
7. **Stay Within Limits** - Max 50-100 DMs/day per account
8. **Warm Up Accounts** - Start slow, increase gradually

## 🔄 Updates

To update to the latest version:
```bash
git pull
npm install
npm run build
npm start
```

Your browser will automatically load the new interface!

---

Enjoy your Instagram DM automation! 🎉
