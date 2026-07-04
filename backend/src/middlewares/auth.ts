import { Context, Next } from 'hono';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

// Simple base64 decoding of JWT payload (Hono environment friendly)
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing bearer token' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = parseJwt(token);

  if (!payload) {
    return c.json({ error: 'Unauthorized: Invalid token format' }, 401);
  }

  // Check token expiration
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < currentTimestamp) {
    return c.json({ error: 'Unauthorized: Token expired' }, 401);
  }

  // In Amazon Cognito, the user ID is in the 'sub' field
  const user: AuthUser = {
    id: payload.sub || payload.uid,
    email: payload.email || '',
    name: payload.name || payload.given_name || 'Valued Customer',
    isAdmin: payload['cognito:groups']?.includes('Admin') || payload.isAdmin || false,
  };

  c.set('user', user);
  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user') as AuthUser | undefined;
  if (!user || !user.isAdmin) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  await next();
}
