import { NextRequest, NextResponse } from 'next/server';

const USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USER || '';
const PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASS || '';

export function middleware(req: NextRequest) {
  if (!USERNAME || !PASSWORD) {
    console.error('❌ BASIC AUTH ENV VARIABLES MISSING');
    return new NextResponse('Internal server error', { status: 500 });
  }

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
      'WWW-Authenticate': 'Basic realm="Protected"',
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};