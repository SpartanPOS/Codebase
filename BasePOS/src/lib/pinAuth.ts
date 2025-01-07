/**
 * custom auth library built by Alek
 */

import {generateKeyPairSync, randomUUID} from 'node:crypto';
import {createClient} from 'redis';
import * as crypto from 'node:crypto';

const client = createClient();
client.on('connect', () => console.log('Redis client connected'));
client.on('error', (err) => console.log('Redis Client Error', err));
if (process.env.DEBUG == 'true') {
  client.on('query', (query) => console.log('Redis Query', query));
}

await client.connect();

class CryptoInstance {
  private pubKey: crypto.KeyObject | undefined;
  public sessionId: string;
  public clientKey: string | undefined;

  constructor(restore?: {sessionId: string, pubKey: string, clientKey: string}) {
    if (restore) {
      this.sessionId = restore.sessionId;
      this.clientKey = restore.clientKey;
      this.pubKey = crypto.createPublicKey(restore.pubKey);
    } else {
      this.sessionId = randomUUID();
      this.clientKey = undefined;
      this.pubKey = undefined;
      this.getKeys();
    }
  }

  async getKeys(): Promise<void> {
    const generated = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: process.env.PINAUTH_SECRET,
      },
    });
    try {
      await client.set(`${this.sessionId}`, generated.privateKey, {EX: 30});
      if (!(await client.exists(`${this.sessionId}`))) {
        throw new Error();
      }
      generated.privateKey = '';
    } catch (err) {
      console.error(err);
    }

    this.pubKey = crypto.createPublicKey(generated.publicKey);
  }

  async setClientKey(clientKey: string): Promise<void> {
    this.clientKey = clientKey;
  }

  async verifyClientChallenge(challenge: string): Promise<boolean> {
    if (!this.clientKey || !this.pubKey) {
      console.error('Public key or private key not set');
      return false; // Or throw an error - handle the case where keys aren't set
    }

    const privateKey = await client.get(this.sessionId);
    if (!privateKey) {
      console.error('Private key not found in Redis');
      return false; // or throw error - private key could not be retreived
    }

    const verifier = crypto.createVerify('RSA-SHA256'); // Choose your algorithm
    verifier.update(challenge);

    try {
      const publicKey = this.pubKey;

      return verifier.verify(publicKey, Buffer.from(this.clientKey, 'base64'));
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}

export default CryptoInstance;
