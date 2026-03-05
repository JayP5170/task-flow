import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export async function middleware(request: NextRequest) {
  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Update request and response cookies to keep them in sync
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Use getSession to check for an active session
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const { pathname } = request.nextUrl;


  // 1. Root Page (/) Logic
  if (pathname === '/') {
    const redirectUrl = new URL(user ? '/dashboard' : '/login', request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // 2. Auth Page Restriction (login/register)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  if (isAuthPage && user) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // 3. Dashboard Protection
  const isDashboardPage = pathname.startsWith('/dashboard');
  if (isDashboardPage && !user) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*'],
};