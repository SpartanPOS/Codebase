import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {SignJWT} from 'jose';
import {prisma} from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/** Login using pin code
 *
 * @param {NextRequest} request
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  body.pin = body.pin.toString();

  if (body.pin.length !== 4) {
    return NextResponse.json(
        {error: 'PIN must be 4 digits'},
        {status: 400},
    );
  }

  console.log('body', body);

  const employee = await prisma.employee.findUnique({
    where: {
      pin: body.pin,
    },
  });

  console.debug('employee', employee);

  if (!employee) {
    return NextResponse.json(
        {error: 'Invalid PIN'},
        {status: 401},
    );
  }

  const token = await new SignJWT({})
      .setProtectedHeader({alg: 'HS256'})
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(new TextEncoder().encode(JWT_SECRET));

  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 10, // 10 minutes
  });

  return NextResponse.json({
    employeeid: employee.id,
    jwtaccess: token,
  });
}
