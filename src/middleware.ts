import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log({ pathname });
}
