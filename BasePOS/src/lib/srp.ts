import {SRP, SrpServer} from 'fast-srp-hap';

export async function generateSaltAndVerifier(username: string | Buffer, pin: string| Buffer) {
  username = Buffer.from(username);
  pin = Buffer.from(pin);
  const salt = await SRP.genKey(16);
  // Use the PIN as the password for SRP
  const verifier = await SRP.computeVerifier(SRP.params[2048], salt, username, pin);
  return {salt, verifier};
}

export function createSRPServer(username: string, salt: Buffer, verifier: Buffer) {
  return new SrpServer(SRP.params['2048'], verifier, salt);
}
