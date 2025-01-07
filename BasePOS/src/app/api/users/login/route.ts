import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import CryptoInstance from '@/lib/pinAuth';

export async function POST(request: NextRequest) {
  try {
    const {username} = await request.json();

    const user = await prisma.employee.findUnique({
      where: {username},
      select: {username: true, salt: true, verifier: true},
    });

    if (!user) {
      return NextResponse.json(
          {error: 'User not found'},
          {status: 404},
      );
    }
    const session = new CryptoInstance();

    // const server = {}

    // const sessionId = await sessionStore.createSession(server, user);

    return NextResponse.json({
      salt: user.salt,
      B: session.toString(),
      sessionId: '',
    });
  } catch (error) {
    return NextResponse.json(
        {error: error},
        {status: 500},
    );
  }
}
