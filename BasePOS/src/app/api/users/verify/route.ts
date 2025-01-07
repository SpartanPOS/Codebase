import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {SignJWT} from 'jose';
import {sessionStore} from '@/lib/sessionStore';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const {sessionId, clientkey, clientchallenge} = await request.json();
    const server = await sessionStore.getSession(sessionId);

    if (!sessionId) return null;

    if (!server) {
      console.log('is not server');
      return NextResponse.json(
          {error: 'Authentication Verification Error: Invalid Session'},
          {status: 401},
      );
    }

    let M2: Buffer | undefined;
    try {
      console.log('we trying');
      server.checkM1(Buffer.from(clientchallenge));
      M2 = server.computeM2();
      console.log('m1 checked');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.log('error with m2:  ', errorMessage);
      return NextResponse.json(
          {error: 'error with the m2 thingy'},
          {status: 401},
      );
    }

    if (typeof M2 === 'undefined' || M2 === null) {
      return NextResponse.json(
          {error: 'Invalid session'},
          {status: 401},
      );
    }

    console.log('valid session');

    try {
      console.log('we trying');
      server.setA(Buffer.from(clientkey, 'hex'));
      const M2 = server.computeM2();

      if (!M2) {
        return NextResponse.json(
            {error: 'failed to generate server proof'},
            {status: 500},
        );
      }

      // Create JWT token
      const token = await new SignJWT({})
          .setProtectedHeader({alg: 'HS256'})
          .setIssuedAt()
          .setExpirationTime('24h')
          .sign(new TextEncoder().encode(JWT_SECRET));

      console.log('yeah! heres a token');

      // Set JWT in HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return NextResponse.json({
        M2: M2.toString('hex'),
      });
    } catch (error) {
      sessionStore.removeSession(sessionId);
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
        {error: 'Verification failed: ' + error},
        {status: 401},
    );
  }
}
