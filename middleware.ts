import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const USERNAME = process.env.BASIC_AUTH_USER!;
  const PASSWORD = process.env.BASIC_AUTH_PASS!;

  if (basicAuth) {
    const [, base64] = basicAuth.split(' ');
    const [user, pass] = atob(base64).split(':');

    if (user === USERNAME && pass === PASSWORD) {
      return NextResponse.next();
    }
  }

  const res = new NextResponse('Authentication required', {
    status: 401,
  });
  res.headers.set('WWW-Authenticate', 'Basic realm="Secure Area"');
  return res;
}

// Apply to all pages
export const config = {
  matcher: '/',
};
