import { randomBytes } from 'crypto';

export interface InstagramSession {
  sessionId: string;
  username: string;
  serializedState: string;
  createdAt: Date;
  expiresAt: Date;
}

export class SessionManager {
  private sessions: Map<string, InstagramSession> = new Map();
  private readonly SESSION_TTL_HOURS: number;

  constructor() {
    // Get session TTL from environment or default to 24 hours
    this.SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '24', 10);

    // Start cleanup interval (every hour)
    this.startCleanupInterval();
  }

  /**
   * Create a new session
   */
  createSession(username: string, serializedState: string): string {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_TTL_HOURS * 60 * 60 * 1000);

    const session: InstagramSession = {
      sessionId,
      username,
      serializedState,
      createdAt: now,
      expiresAt
    };

    this.sessions.set(sessionId, session);

    console.log(`💾 Created session ${sessionId} for ${username}, expires: ${expiresAt.toISOString()}`);

    return sessionId;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): InstagramSession | undefined {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    // Check if expired
    if (this.isSessionExpired(sessionId)) {
      this.clearSession(sessionId);
      return undefined;
    }

    return session;
  }

  /**
   * Check if a session is expired
   */
  isSessionExpired(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return true;
    }

    return new Date() > session.expiresAt;
  }

  /**
   * Clear a specific session
   */
  clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      console.log(`🗑️  Cleared session ${sessionId} for ${session.username}`);
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Get all sessions
   */
  getAllSessions(): InstagramSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clear all expired sessions
   */
  private clearExpiredSessions(): void {
    const now = new Date();
    let clearedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      console.log(`🧹 Cleaned up ${clearedCount} expired session(s)`);
    }
  }

  /**
   * Start automatic cleanup of expired sessions
   */
  private startCleanupInterval(): void {
    // Run cleanup every hour
    const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

    setInterval(() => {
      this.clearExpiredSessions();
    }, CLEANUP_INTERVAL_MS);

    console.log(`🧹 Session cleanup interval started (every ${CLEANUP_INTERVAL_MS / 1000 / 60} minutes)`);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}
