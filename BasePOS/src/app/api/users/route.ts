// app/api/users/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {generateSaltAndVerifier} from '@/lib/srp';

// Store SRP sessions in memory (consider using Redis for production)

/** to be removed
 * @param {NextRequest} request
 */
export async function POST(request: NextRequest) {
  // [TODO]: move createUser to admin api
  try {
    const {username, pin} = await request.json();

    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
          {error: 'PIN must be 4 digits'},
          {status: 400},
      );
    }

    const {salt, verifier} = await generateSaltAndVerifier(username, String(pin));

    if (!salt || !verifier) {
      return NextResponse.json(
          {error: 'Failed to generate salt and verifier'},
          {status: 500},
      );
    }

    await prisma.employee.create({
      data: {
        username,
        salt: salt.toString('hex'),
        verifier: verifier.toString('hex'),
      },
    });

    return NextResponse.json({success: true});
  } catch (error) {
    if ( (error as Error).cause === 'P2002') {
      return NextResponse.json(
          {error: 'Username already exists'},
          {status: 400},
      );
    }

    console.log(error);
    return NextResponse.json(
        {error: 'Failed to create user'},
        {status: 500},
    );
  }
}
