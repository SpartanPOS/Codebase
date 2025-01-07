import {prisma} from '@/lib/prisma';
import {NextRequest, NextResponse} from 'next/server';

/** create employee
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

  prisma.employee.create({
    data: {
      pin: body.pin,
    },
  }).then((res) => {
    console.log(res);
  }).catch((err) => {
    console.log(err);
  });
  return new Response('success');
}
