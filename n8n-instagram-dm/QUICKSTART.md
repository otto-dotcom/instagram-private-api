# Quick Start Guide

Get up and running in 5 minutes!

**Choose your interface:**
- 🌐 **[Web Interface](#web-interface)** - No coding, just click and send!
- 🔌 **[API/n8n Integration](#apin8n-integration)** - For automation workflows

---

## 🌐 Web Interface

Perfect for manual DM campaigns and testing.

### Step 1: Install & Start

```bash
cd n8n-instagram-dm
npm install
npm run build
npm start
```

### Step 2: Open Browser

Go to: **http://localhost:3000**

### Step 3: Send Your First DM

1. Click **Single DM** tab
2. Enter your Instagram username & password
3. Add recipient username
4. Write your message
5. Click **Send DM**

**Done! 🎉**

For detailed web app guide, see [WEB_APP_GUIDE.md](./WEB_APP_GUIDE.md) or [START_HERE.md](./START_HERE.md)

---

## 🔌 API/n8n Integration

For programmatic access and workflow automation.

## Step 1: Install Dependencies

```bash
cd n8n-instagram-dm
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
API_KEY=my-secret-key-123
SESSION_TTL_HOURS=24
```

## Step 3: Build & Start

```bash
npm run build
npm start
```

You should see:
```
🚀 Instagram DM Automation Server running on port 3000
```

## Step 4: Test with curl

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Send a Test DM

```bash
curl -X POST http://localhost:3000/api/send-dm \
  -H "Content-Type: application/json" \
  -H "X-API-Key: my-secret-key-123" \
  -d '{
    "username": "your_instagram_username",
    "password": "your_instagram_password",
    "recipient": "target_username",
    "message": "Hey! This is a test message from my automation system."
  }'
```

## Step 5: Integrate with n8n

### In n8n:

1. Add **HTTP Request** node
2. Configure:
   - **Method:** POST
   - **URL:** `http://localhost:3000/api/send-dm`
   - **Authentication:** Header Auth
     - Name: `X-API-Key`
     - Value: `my-secret-key-123`
   - **Body:**
     ```json
     {
       "username": "{{ $env.INSTAGRAM_USERNAME }}",
       "password": "{{ $env.INSTAGRAM_PASSWORD }}",
       "recipient": "{{ $json.instagram_username }}",
       "message": "{{ $json.ai_message }}"
     }
     ```

3. Execute!

## Your First Workflow

### Simple Example: Daily Outreach

```
[Schedule: Daily 9AM]
    ↓
[Airtable: Get Leads]
    ↓
[OpenAI: Generate Message]
    ↓
[HTTP: Send Instagram DM]  ← This service!
    ↓
[Airtable: Mark as Contacted]
```

## Tips

- **Store Instagram credentials in n8n environment variables** (not in workflows)
- **Start with 10-20 DMs per day** to warm up your account
- **Use `delayMs: 5000-10000`** to avoid rate limits
- **Save and reuse `sessionId`** for faster requests

## Next Steps

- Read the full [README.md](./README.md) for advanced features
- Set up bulk DM sending
- Integrate with your AI agent
- Deploy to production

## Need Help?

Check the troubleshooting section in README.md!
