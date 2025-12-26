import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { InstagramDMService } from './services/instagram-dm.service';
import { SessionManager } from './services/session-manager.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to allow inline scripts in our web app
}));
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize services
const sessionManager = new SessionManager();
const dmService = new InstagramDMService(sessionManager);

// API Key middleware for security
const validateApiKey = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!API_KEY) {
    // If no API key is set, allow all requests (dev mode)
    return next();
  }

  if (apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API key'
    });
  }
};

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Instagram DM Automation for n8n'
  });
});

/**
 * Send Instagram DM
 * POST /api/send-dm
 *
 * Body:
 * {
 *   "username": "your_ig_username",      // Instagram username (sender)
 *   "password": "your_ig_password",      // Instagram password (sender)
 *   "recipient": "recipient_username",   // Recipient's Instagram username
 *   "message": "Your custom message",    // Message text
 *   "sessionId": "optional_session_id"   // Optional: reuse session
 * }
 */
app.post('/api/send-dm', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { username, password, recipient, message, sessionId } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: username and password are required'
      });
    }

    if (!recipient || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipient and message are required'
      });
    }

    // Send DM
    const result = await dmService.sendDirectMessage({
      username,
      password,
      recipient,
      message,
      sessionId
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error sending DM:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send DM',
      details: error.toString()
    });
  }
});

/**
 * Send bulk Instagram DMs
 * POST /api/send-bulk-dm
 *
 * Body:
 * {
 *   "username": "your_ig_username",
 *   "password": "your_ig_password",
 *   "recipients": [
 *     {
 *       "username": "recipient1",
 *       "message": "Personalized message 1"
 *     },
 *     {
 *       "username": "recipient2",
 *       "message": "Personalized message 2"
 *     }
 *   ],
 *   "sessionId": "optional_session_id",
 *   "delayMs": 5000  // Delay between messages (default: 5000ms)
 * }
 */
app.post('/api/send-bulk-dm', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { username, password, recipients, sessionId, delayMs = 5000 } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: username and password are required'
      });
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'recipients must be a non-empty array'
      });
    }

    const results = await dmService.sendBulkDirectMessages({
      username,
      password,
      recipients,
      sessionId,
      delayMs
    });

    res.json({
      success: true,
      data: {
        total: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error: any) {
    console.error('Error sending bulk DMs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send bulk DMs',
      details: error.toString()
    });
  }
});

/**
 * Get session info
 * GET /api/session/:sessionId
 */
app.get('/api/session/:sessionId', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        username: session.username,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isExpired: sessionManager.isSessionExpired(sessionId)
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Clear session
 * DELETE /api/session/:sessionId
 */
app.delete('/api/session/:sessionId', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    sessionManager.clearSession(sessionId);

    res.json({
      success: true,
      message: 'Session cleared successfully'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all active sessions
 * GET /api/sessions
 */
app.get('/api/sessions', validateApiKey, async (req: Request, res: Response) => {
  try {
    const sessions = sessionManager.getAllSessions();

    res.json({
      success: true,
      data: {
        count: sessions.length,
        sessions: sessions.map(s => ({
          sessionId: s.sessionId,
          username: s.username,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          isExpired: sessionManager.isSessionExpired(s.sessionId)
        }))
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Instagram DM Automation Server running on port ${PORT}`);
  console.log(``);
  console.log(`🌐 Web Interface: http://localhost:${PORT}`);
  console.log(`   Open this URL in your browser to access the web app!`);
  console.log(``);
  console.log(`📝 API Endpoints:`);
  console.log(`   - POST /api/send-dm - Send single DM`);
  console.log(`   - POST /api/send-bulk-dm - Send bulk DMs`);
  console.log(`   - GET /api/session/:sessionId - Get session info`);
  console.log(`   - DELETE /api/session/:sessionId - Clear session`);
  console.log(`   - GET /api/sessions - List all sessions`);
  console.log(`   - GET /health - Health check`);
  console.log(``);
  console.log(`🔐 API Key: ${API_KEY ? 'Enabled' : 'Disabled (Development Mode)'}`);
  console.log(`⏰ Session TTL: ${process.env.SESSION_TTL_HOURS || 24} hours`);
});

export default app;
