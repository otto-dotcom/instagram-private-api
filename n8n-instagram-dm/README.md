# Instagram DM Automation for n8n

Automate Instagram Direct Messages (DMs) with n8n workflow automation. This server integrates with your existing AI lead gen workflow to send personalized Instagram DMs alongside SMS and email outreach.

## 🎯 Overview

This service provides a REST API that enables n8n to send Instagram DMs programmatically. Perfect for:
- AI-powered personalized outreach campaigns
- Lead generation workflows
- Multi-channel marketing automation (SMS + Email + Instagram DMs)
- Integration with Airtable, Supabase, Apify, and other data sources

## ✨ Features

- ✅ **Send Single DMs** - Send personalized messages to individual Instagram users
- ✅ **Bulk DM Sending** - Send customized messages to multiple recipients
- ✅ **Session Management** - Reuse Instagram sessions to avoid repeated logins
- ✅ **Rate Limiting** - Configurable delays between messages to prevent spam detection
- ✅ **API Key Authentication** - Secure your endpoints with API keys
- ✅ **n8n Ready** - Easy integration with n8n HTTP Request nodes
- ✅ **Error Handling** - Detailed error responses for debugging
- ✅ **Session Persistence** - Sessions cached for 24 hours (configurable)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Instagram account(s) for sending messages
- n8n instance (cloud or self-hosted)

## 🚀 Quick Start

### 1. Installation

```bash
cd n8n-instagram-dm
npm install
```

### 2. Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
PORT=3000
API_KEY=your-secret-api-key-here
SESSION_TTL_HOURS=24
```

### 3. Build

```bash
npm run build
```

### 4. Start the Server

**Production:**
```bash
npm start
```

**Development (with auto-reload):**
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📡 API Endpoints

### Health Check
```
GET /health
```

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Instagram DM Automation for n8n"
}
```

---

### Send Single DM

```
POST /api/send-dm
```

Send a direct message to a single recipient.

**Headers:**
```
Content-Type: application/json
X-API-Key: your-secret-api-key-here
```

**Request Body:**
```json
{
  "username": "your_instagram_username",
  "password": "your_instagram_password",
  "recipient": "target_username",
  "message": "Hi! I noticed you're interested in AI automation...",
  "sessionId": "optional-session-id-from-previous-request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "recipient": "target_username",
    "message": "Hi! I noticed you're interested in AI automation...",
    "threadId": "340282366841710300949128268024127652108",
    "itemId": "29260188881226760384348954034176",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "sessionId": "a1b2c3d4e5f6..."
  }
}
```

---

### Send Bulk DMs

```
POST /api/send-bulk-dm
```

Send personalized messages to multiple recipients.

**Headers:**
```
Content-Type: application/json
X-API-Key: your-secret-api-key-here
```

**Request Body:**
```json
{
  "username": "your_instagram_username",
  "password": "your_instagram_password",
  "recipients": [
    {
      "username": "recipient1",
      "message": "Hi John! I noticed your interest in AI..."
    },
    {
      "username": "recipient2",
      "message": "Hey Sarah! Your recent post about automation..."
    }
  ],
  "sessionId": "optional-session-id",
  "delayMs": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "success": true,
        "recipient": "recipient1",
        "message": "Hi John! I noticed your interest in AI...",
        "threadId": "340282366841710300949128268024127652108",
        "itemId": "29260188881226760384348954034176",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "sessionId": "a1b2c3d4e5f6..."
      },
      {
        "success": true,
        "recipient": "recipient2",
        "message": "Hey Sarah! Your recent post about automation...",
        "threadId": "340282366841710300949128268024127652109",
        "itemId": "29260188881226760384348954034177",
        "timestamp": "2024-01-15T10:30:05.000Z",
        "sessionId": "a1b2c3d4e5f6..."
      }
    ]
  }
}
```

---

### Session Management

**Get Session Info:**
```
GET /api/session/:sessionId
```

**Delete Session:**
```
DELETE /api/session/:sessionId
```

**List All Sessions:**
```
GET /api/sessions
```

## 🔗 n8n Integration Guide

### Workflow Example: AI Lead Gen with Instagram DMs

Here's how to integrate this into your existing workflow:

```
[Airtable/Supabase] → [AI Agent] → [HTTP Request: Send DM] → [Update Status]
```

### n8n HTTP Request Node Configuration

**1. Single DM:**

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/send-dm`
- **Authentication:** Header Auth
  - **Name:** `X-API-Key`
  - **Value:** `your-secret-api-key-here`
- **Body:**
  ```json
  {
    "username": "{{ $env.INSTAGRAM_USERNAME }}",
    "password": "{{ $env.INSTAGRAM_PASSWORD }}",
    "recipient": "{{ $json.instagram_username }}",
    "message": "{{ $json.ai_generated_message }}",
    "sessionId": "{{ $json.session_id }}"
  }
  ```

**2. Bulk DM:**

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/send-bulk-dm`
- **Authentication:** Header Auth
  - **Name:** `X-API-Key`
  - **Value:** `your-secret-api-key-here`
- **Body:**
  ```json
  {
    "username": "{{ $env.INSTAGRAM_USERNAME }}",
    "password": "{{ $env.INSTAGRAM_PASSWORD }}",
    "recipients": {{ $json.recipients }},
    "delayMs": 5000
  }
  ```

### Complete n8n Workflow Example

```
1. [Schedule Trigger] - Run daily at 9 AM
   ↓
2. [Supabase/Airtable] - Fetch leads from database
   WHERE status = 'qualified' AND contacted_instagram = false
   ↓
3. [Function/Code] - Transform data
   // Map data to expected format
   return items.map(item => ({
     instagram_username: item.json.instagram_handle,
     name: item.json.name,
     company: item.json.company,
     interest: item.json.interest_area
   }));
   ↓
4. [OpenAI/Claude] - Generate personalized message
   Prompt: "Write a personalized cold outreach message for {{name}}
   from {{company}} who is interested in {{interest}}.
   Keep it under 300 characters and focus on value."
   ↓
5. [HTTP Request] - Send Instagram DM
   POST http://localhost:3000/api/send-dm
   Body: {
     "username": "your_account",
     "password": "your_password",
     "recipient": "{{ $json.instagram_username }}",
     "message": "{{ $('OpenAI').item.json.message }}"
   }
   ↓
6. [Supabase/Airtable] - Update contact status
   SET contacted_instagram = true,
       last_contact_date = NOW(),
       dm_sent = true
```

## 🔐 Security Best Practices

1. **Use API Keys in Production**
   - Set a strong `API_KEY` in your `.env` file
   - Never commit `.env` to version control

2. **Secure Your Instagram Credentials**
   - Store credentials in n8n environment variables
   - Don't hardcode them in workflows

3. **Use HTTPS in Production**
   - Deploy behind a reverse proxy (Nginx, Caddy)
   - Use SSL certificates

4. **Rate Limiting**
   - Set appropriate `delayMs` (5000-10000ms recommended)
   - Don't send too many DMs in a short period

5. **Monitor Sessions**
   - Check `/api/sessions` periodically
   - Clear old sessions if needed

## 📊 Session Management

### Why Sessions?

Instagram requires authentication for each request. To avoid logging in repeatedly (which can trigger security checks), we cache authenticated sessions.

### How It Works

1. First request creates a session and returns `sessionId`
2. Subsequent requests reuse the session (faster, safer)
3. Sessions expire after 24 hours (configurable)
4. Expired sessions are automatically cleaned up

### Example: Reusing Sessions in n8n

```
1. First DM Request
   Response: { "sessionId": "abc123..." }
   ↓
2. Save sessionId to variable
   {{ $node["HTTP Request"].json["data"]["sessionId"] }}
   ↓
3. Use in next requests
   Body: { "sessionId": "{{ $json.sessionId }}" }
```

## 🐛 Troubleshooting

### Common Issues

**1. "Two-factor authentication is required"**
- Disable 2FA on your Instagram account, or
- Use an account without 2FA for automation

**2. "Instagram checkpoint required"**
- Login via the Instagram app
- Complete the security verification
- Try again after 24 hours

**3. "Rate limit exceeded"**
- Increase `delayMs` between messages
- Reduce the number of DMs per hour
- Use multiple Instagram accounts

**4. "User not found"**
- Verify the username is correct
- Check if the account is public/exists
- User may have blocked your account

**5. "Session expired"**
- Normal behavior after 24 hours
- Let the system create a new session automatically
- Or manually delete and recreate

### Debug Mode

Check server logs for detailed information:
```bash
npm run dev
```

## 📈 Best Practices

### Message Quality
- Personalize messages using AI
- Keep messages under 300 characters
- Include clear value proposition
- Always have a clear call-to-action

### Sending Schedule
- Send during business hours (9 AM - 6 PM)
- Avoid weekends for B2B outreach
- Spread messages throughout the day
- Don't send more than 50-100 DMs per day per account

### Account Safety
- Use dedicated Instagram accounts for automation
- Gradually increase daily volume
- Warm up new accounts (start with 10-20 DMs/day)
- Follow Instagram's terms of service

## 🚢 Deployment

### Docker Deployment (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t instagram-dm-automation .
docker run -p 3000:3000 --env-file .env instagram-dm-automation
```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start dist/server.js --name instagram-dm
pm2 save
pm2 startup
```

### Cloud Deployment

Works great on:
- Railway
- Render
- Heroku
- DigitalOcean
- AWS EC2/ECS
- Google Cloud Run

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `API_KEY` | No | - | API authentication key |
| `SESSION_TTL_HOURS` | No | 24 | Session lifetime in hours |
| `IG_PROXY` | No | - | Proxy for Instagram requests |

## 🤝 Integration with Your Workflow

Based on your existing workflow:

```
[Airtable/Apify/Supabase]
   ↓
[AI Agent - Generate Message]
   ↓
┌──────────────────────┐
│ Send SMS (existing)  │
│ Send Email (existing)│
│ Send Instagram DM ✨ │ ← NEW!
└──────────────────────┘
```

This service slots right into your existing workflow as another channel for your AI-powered outreach!

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review server logs
- Test endpoints with Postman/curl

## 📄 License

MIT License - See main repository for details

---

**🎉 You're all set!** Start sending personalized Instagram DMs through your n8n workflows.
