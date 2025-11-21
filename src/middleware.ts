import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware simplificado
 * A proteção de rotas é feita client-side pois usamos localStorage
 */
export function middleware(request: NextRequest) {
  // Middleware apenas para logs ou configurações futuras
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

