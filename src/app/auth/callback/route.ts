import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('state') || '/';

  if (code) {
    try {
      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'infistyle';
      const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';
      
      const tokenEndpoint = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`;
      const redirectUri = `${origin}/auth/callback`;

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Failed to exchange token');
      }

      if (data.id_token) {
        let targetPath = next;
        try {
          const payload = JSON.parse(Buffer.from(data.id_token.split('.')[1], 'base64').toString());
          if (payload.email?.toLowerCase() === 'admin@infistyle.com') {
            targetPath = '/admin';
          }
        } catch (_) {}

        // Construct standard Next.js Response redirect
        const url = new URL(targetPath, origin);
        const res = NextResponse.redirect(url);
        
        // Save the ID token in cookie for the middleware
        res.cookies.set('infistyle_session', data.id_token, {
          path: '/',
          maxAge: data.expires_in || 3600,
          sameSite: 'lax',
          secure: true,
        });

        return res;
      }
    } catch (err: any) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Auth callback failed: ' + err.message)}`);
    }
  }

  const oauthError = searchParams.get('error_description') || searchParams.get('error') || 'No auth code returned';
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`);
}
