import {SRP, SrpServer} from 'fast-srp-hap';
import {prisma} from './prisma';
import Client from 'redis';

interface SRPSession {
  server: InstanceType<typeof SrpServer>;
  createdAt: number;
}

/* storage for sessions
* @class SessionStore
* @property {Map<string, SRPSession>} sessions - Map of session IDs to SRP sessions
* @property {number} SESSION_TIMEOUT - Session timeout in milliseconds
*/
class SessionStore {
  private sessions: Map<string, SRPSession> = new Map();
  private readonly SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  private client = Client.createClient();
  private conn = this.client.connect();

  /** Create a new session
  * @arg {InstanceType<SrpServer>} server
  * @arg {{}} user
  * @return {Promise<string>}
  */
  async createSession(server: InstanceType<typeof SrpServer>,
      user: { username: string, salt: string, verifier: string }): Promise<string> {
    // Clean up expired sessions
    this.cleanExpiredSessions();

    // Generate unique session ID
    const sessionId = Math.random().toString(36).substring(2);

    // Store session with timestamp
    this.client.set(sessionId, JSON.stringify(user));

    this.sessions.set(sessionId, {server, createdAt: Date.now()});

    console.log('session  "' + sessionId + '"  created');

    return sessionId;
  }

  /**
 * Get a session by ID
 * @param {string} sessionId - The session ID
 * @return {Promise<InstanceType<SrpServer> | null>} - The SRP server instance or null if not found
 */
  async getSession(sessionId: string): Promise<InstanceType<typeof SrpServer> | null> {
    if (!sessionId) return null;

    // Clean up expired sessions
    this.cleanExpiredSessions();

    let session = this.sessions.get(sessionId);

    if (!session) {
      const storedSession = await prisma.session.findUnique({
        where: {sessionId: sessionId},
        select: {user: true},
      });

      if (storedSession) {
        const user = typeof storedSession['user'] === 'string' ?
          JSON.parse(storedSession['user']) :
          storedSession['user'];
        const server = new SrpServer(SRP.params['2048'], Buffer.from(user.salt), Buffer.from(user.verifier));
        this.sessions.set(sessionId, {server, createdAt: Date.now()});
        session = {server, createdAt: Date.now()};
      }
    }

    if (!session) {
      return null;
    }
    // Check if session has expired
    if (Date.now() - session?.createdAt > this.SESSION_TIMEOUT) {
      console.log('session  "' + sessionId + '"  expired');
      this.sessions.delete(sessionId);
      prisma.session.delete({
        where: {sessionId},
      });
      return null;
    }

    return session.server;
  }

  /**
   * Remove a session by ID
   * @param {string} sessionId - The session ID
   * @return {Promise<void>}
   */
  async removeSession(sessionId: string): Promise<void> {
    console.log('session  ' + sessionId + '  removed');
    await prisma.session.delete({
      where: {sessionId},
    });
    this.sessions.delete(sessionId);
  }

  /**
   * Clean up expired sessions
   * @private
   */
  private cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.createdAt > this.SESSION_TIMEOUT) {
        console.log('session  "' + sessionId + '"  expired');
        prisma.session.delete({
          where: {sessionId},
        });
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export a singleton instance
export const sessionStore = new SessionStore();
