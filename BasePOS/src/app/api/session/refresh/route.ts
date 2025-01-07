import {NextResponse} from 'next/server';
import {jwtVerify, SignJWT} from 'jose';
import {cookies} from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST() {
  const store = await cookies();
  try {
    const token = await store.get('auth-token')?.value;

    const secret = new TextEncoder().encode(JWT_SECRET);

    if (token) {
      const decoded = await jwtVerify(token, secret);

      if (!decoded.payload.exp) {
        return;
      }

      // Check if token is close to expiring (e.g., within 15 minutes)
      const now = Math.floor(Date.now() / 1000);
      if (decoded.payload.exp - now < 15 * 60) {
        // Generate a new token
        const newToken = await new SignJWT({})
            .setProtectedHeader({alg: 'HS256'})
            .setIssuedAt()
            .setExpirationTime('3m')
            .sign(new TextEncoder().encode(JWT_SECRET));

        store.set('auth-token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 3, // 3 minutes
        });

        return NextResponse.json({message: 'Token refreshed'});
      } else {
        return NextResponse.json({message: true});
      }
    } else {
      return NextResponse.json({message: 'No token provided'}, {status: 401});
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({message: 'Invalid token'}, {status: 401});
  }
}
