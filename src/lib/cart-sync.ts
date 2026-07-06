import { api } from './aws/api';

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export async function syncCartToBackend(items: any[]) {
  if (typeof window === 'undefined') return;

  try {
    const token = localStorage.getItem('infistyle_id_token');
    let userId = '';
    let userEmail = 'Guest';
    let userName = 'Guest Customer';

    if (token) {
      const claims = parseJwt(token);
      if (claims) {
        userId = claims.sub || claims['cognito:username'] || '';
        userEmail = claims.email || 'Guest';
        userName = claims.name || claims.email || 'Guest Customer';
      }
    }

    if (!userId) {
      let guestId = localStorage.getItem('infistyle_guest_id');
      if (!guestId) {
        guestId = 'GUEST-' + Math.random().toString(36).substring(2, 11).toUpperCase();
        localStorage.setItem('infistyle_guest_id', guestId);
      }
      userId = guestId;
    }

    await api.syncCart({
      userId,
      userEmail,
      userName,
      items
    });
  } catch (err) {
    console.error('Failed to sync cart to backend:', err);
  }
}
