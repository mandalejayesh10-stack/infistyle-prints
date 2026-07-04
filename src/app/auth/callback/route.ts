import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // In production (Vercel), handle forwarded headers properly
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Exchange error: ' + error.message)}`);
    }
  }

  // Extract Google or Supabase provider error parameter if code is missing
  const errorCode = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const finalError = errorDescription || errorCode || 'No authorization code returned from provider';

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(finalError)}`);
}
