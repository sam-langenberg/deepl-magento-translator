import { NextRequest, NextResponse } from 'next/server';

const USERNAME = process.env.BASIC_AUTH_USER!;
const PASSWORD = process.env.BASIC_AUTH_PASS!;

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const [scheme, encoded] = basicAuth.split(' ');

    if (scheme === 'Basic') {
      const decoded = Buffer.from(encoded, 'base64').toString();
      const [user, pass] = decoded.split(':');

      if (user === USERNAME && pass === PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm=\"Protected\"',
    },
  });
}

// 👇 Add this exactly at the bottom
export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
