import { NextRequest, NextResponse } from 'next/server';

const USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USER || 'sam';
const PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASS || 'letmein';

export function middleware(req: NextRequest) {
  // Log for debugging in Vercel logs
  console.log('🧪 BASIC AUTH ENV:', {
    USERNAME,
    PASSWORD_SET: !!process.env.NEXT_PUBLIC_BASIC_AUTH_PASS,
  });

  // If env vars are still missing — return 500
  if (!USERNAME || !PASSWORD) {
    return new NextResponse('Internal server error (auth not configured)', { status: 500 });
  }

  const authHeader = req.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');

    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString();
      const [user, pass] = decoded.split(':');

      if (user === USERNAME && pass === PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  // If auth fails, prompt browser login
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Restricted Area"',
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
