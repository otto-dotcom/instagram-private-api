import { IgApiClient } from 'instagram-private-api';
import { SessionManager, InstagramSession } from './session-manager.service';

export interface SendDMOptions {
  username: string;
  password: string;
  recipient: string;
  message: string;
  sessionId?: string;
}

export interface BulkRecipient {
  username: string;
  message: string;
}

export interface SendBulkDMOptions {
  username: string;
  password: string;
  recipients: BulkRecipient[];
  sessionId?: string;
  delayMs?: number;
}

export interface DMResult {
  success: boolean;
  recipient: string;
  message?: string;
  threadId?: string;
  itemId?: string;
  timestamp?: string;
  error?: string;
  sessionId?: string;
}

export class InstagramDMService {
  constructor(private sessionManager: SessionManager) {}

  /**
   * Get or create an authenticated Instagram client
   */
  private async getAuthenticatedClient(
    username: string,
    password: string,
    sessionId?: string
  ): Promise<{ client: IgApiClient; sessionId: string; isNewSession: boolean }> {
    let client: IgApiClient;
    let finalSessionId: string;
    let isNewSession = false;

    // Try to reuse existing session
    if (sessionId) {
      const session = this.sessionManager.getSession(sessionId);
      if (session && !this.sessionManager.isSessionExpired(sessionId)) {
        console.log(`♻️  Reusing session: ${sessionId}`);
        client = new IgApiClient();
        await client.state.deserialize(session.serializedState);
        return { client, sessionId, isNewSession: false };
      } else {
        console.log(`⚠️  Session ${sessionId} expired or not found, creating new session`);
      }
    }

    // Create new session
    console.log(`🔐 Logging in as ${username}...`);
    client = new IgApiClient();

    // Generate device ID
    client.state.generateDevice(username);

    // Set proxy if configured
    if (process.env.IG_PROXY) {
      client.state.proxyUrl = process.env.IG_PROXY;
    }

    try {
      // Login
      await client.account.login(username, password);
      console.log(`✅ Successfully logged in as ${username}`);

      // Serialize and save session
      const serializedState = await client.state.serialize();
      finalSessionId = this.sessionManager.createSession(username, serializedState);
      isNewSession = true;

      console.log(`💾 Session saved: ${finalSessionId}`);

      return { client, sessionId: finalSessionId, isNewSession };

    } catch (error: any) {
      console.error(`❌ Login failed for ${username}:`, error.message);

      // Handle two-factor authentication
      if (error.name === 'IgLoginTwoFactorRequiredError') {
        throw new Error(
          'Two-factor authentication is required. Please disable 2FA or implement 2FA handling in your workflow.'
        );
      }

      // Handle checkpoint required
      if (error.name === 'IgCheckpointError') {
        throw new Error(
          'Instagram checkpoint required. Please login via the Instagram app and complete the security check.'
        );
      }

      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Get user ID from username
   */
  private async getUserIdFromUsername(client: IgApiClient, username: string): Promise<string> {
    try {
      const user = await client.user.searchExact(username);
      if (!user || !user.pk) {
        throw new Error(`User not found: ${username}`);
      }
      return user.pk.toString();
    } catch (error: any) {
      throw new Error(`Failed to find user ${username}: ${error.message}`);
    }
  }

  /**
   * Send a direct message to a single recipient
   */
  async sendDirectMessage(options: SendDMOptions): Promise<DMResult> {
    const { username, password, recipient, message, sessionId } = options;

    try {
      console.log(`📤 Sending DM to ${recipient}...`);

      // Get authenticated client
      const { client, sessionId: finalSessionId, isNewSession } =
        await this.getAuthenticatedClient(username, password, sessionId);

      // Get recipient user ID
      const recipientUserId = await this.getUserIdFromUsername(client, recipient);
      console.log(`👤 Found user ${recipient} (ID: ${recipientUserId})`);

      // Create thread and send message
      const thread = client.entity.directThread([recipientUserId]);
      const result = await thread.broadcastText(message);

      console.log(`✅ DM sent successfully to ${recipient}`);

      // Extract thread_id and item_id from response
      const threadId = (result as any).payload?.thread_id || (result as any).message_metadata?.[0]?.thread_id;
      const itemId = (result as any).payload?.item_id || (result as any).message_metadata?.[0]?.item_id;

      return {
        success: true,
        recipient,
        message,
        threadId,
        itemId,
        timestamp: new Date().toISOString(),
        sessionId: finalSessionId
      };

    } catch (error: any) {
      console.error(`❌ Failed to send DM to ${recipient}:`, error.message);
      return {
        success: false,
        recipient,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Send direct messages to multiple recipients with customized messages
   */
  async sendBulkDirectMessages(options: SendBulkDMOptions): Promise<DMResult[]> {
    const { username, password, recipients, sessionId, delayMs = 5000 } = options;

    console.log(`📮 Sending bulk DMs to ${recipients.length} recipients...`);

    // Get authenticated client once for all messages
    const { client, sessionId: finalSessionId } =
      await this.getAuthenticatedClient(username, password, sessionId);

    const results: DMResult[] = [];

    for (let i = 0; i < recipients.length; i++) {
      const { username: recipientUsername, message } = recipients[i];

      try {
        console.log(`[${i + 1}/${recipients.length}] Sending to ${recipientUsername}...`);

        // Get recipient user ID
        const recipientUserId = await this.getUserIdFromUsername(client, recipientUsername);

        // Create thread and send message
        const thread = client.entity.directThread([recipientUserId]);
        const result = await thread.broadcastText(message);

        // Extract thread_id and item_id from response
        const threadId = (result as any).payload?.thread_id || (result as any).message_metadata?.[0]?.thread_id;
        const itemId = (result as any).payload?.item_id || (result as any).message_metadata?.[0]?.item_id;

        results.push({
          success: true,
          recipient: recipientUsername,
          message,
          threadId,
          itemId,
          timestamp: new Date().toISOString(),
          sessionId: finalSessionId
        });

        console.log(`✅ [${i + 1}/${recipients.length}] Sent to ${recipientUsername}`);

        // Add delay between messages to avoid rate limiting (except for last message)
        if (i < recipients.length - 1) {
          console.log(`⏳ Waiting ${delayMs}ms before next message...`);
          await this.delay(delayMs);
        }

      } catch (error: any) {
        console.error(`❌ [${i + 1}/${recipients.length}] Failed to send to ${recipientUsername}:`, error.message);
        results.push({
          success: false,
          recipient: recipientUsername,
          error: error.message || 'Unknown error occurred'
        });

        // Continue with next recipient even if this one failed
        if (i < recipients.length - 1) {
          console.log(`⏳ Waiting ${delayMs}ms before next message...`);
          await this.delay(delayMs);
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Bulk send complete: ${successCount}/${recipients.length} successful`);

    return results;
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
