import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const USERNAME = process.env.BASIC_AUTH_USER;
  const PASSWORD = process.env.BASIC_AUTH_PASS;

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic') {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(':');

      if (user === USERNAME && pass === PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  const res = new NextResponse('Authentication required', { status: 401 });
  res.headers.set('WWW-Authenticate', 'Basic realm="Secure Area"');
  return res;
}

export const config = {
  matcher: '/',
  runtime: 'experimental-edge',
};
