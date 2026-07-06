export interface CognitoUser {
  username: string;
  email: string;
  name: string;
}

const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';
const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

async function cognitoFetch(action: string, payload: Record<string, any>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Cognito error: ${action} failed`);
  }
  return data;
}

export const cognitoClient = {
  // 1. Sign Up
  async signUp(email: string, password: string, name: string) {
    return await cognitoFetch('SignUp', {
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
      ],
    });
  },

  // 2. Confirm Sign Up (Verify Code)
  async confirmSignUp(email: string, code: string) {
    return await cognitoFetch('ConfirmSignUp', {
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
    });
  },

  // 3. Sign In
  async signIn(email: string, password: string) {
    const data = await cognitoFetch('InitiateAuth', {
      ClientId: clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const authResult = data.AuthenticationResult;
    if (authResult) {
      // Store session details in cookies and localStorage
      localStorage.setItem('infistyle_access_token', authResult.AccessToken);
      localStorage.setItem('infistyle_id_token', authResult.IdToken);
      localStorage.setItem('infistyle_refresh_token', authResult.RefreshToken);
      
      // Save ID Token in document cookie for Next.js Middleware checks
      document.cookie = `infistyle_session=${authResult.IdToken}; path=/; max-age=${authResult.ExpiresIn}; SameSite=Lax; Secure`;
    }
    return authResult;
  },

  // 4. Get Current User Details
  async getUser(accessToken: string): Promise<CognitoUser> {
    const data = await cognitoFetch('GetUser', {
      AccessToken: accessToken,
    });

    const attributes = data.UserAttributes || [];
    const emailAttr = attributes.find((a: any) => a.Name === 'email');
    const nameAttr = attributes.find((a: any) => a.Name === 'name');

    return {
      username: data.Username,
      email: emailAttr ? emailAttr.Value : '',
      name: nameAttr ? nameAttr.Value : '',
    };
  },

  // 5. Get Current Session User Sync (decodes client-side JWT token and syncs cookie to localStorage)
  getSessionUserSync(): CognitoUser | null {
    if (typeof window === 'undefined') return null;

    // Helper to get cookie
    const getCookie = (name: string): string | null => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    };

    // Helper to decode JWT payload
    const parseJwt = (token: string) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    const token = getCookie('infistyle_session') || localStorage.getItem('infistyle_id_token') || localStorage.getItem('infistyle_access_token');
    if (!token) return null;

    const decoded = parseJwt(token);
    if (!decoded) return null;

    // Sync back to localStorage for other client workflows
    if (!localStorage.getItem('infistyle_id_token')) {
      localStorage.setItem('infistyle_id_token', token);
      localStorage.setItem('infistyle_access_token', token);
    }

    return {
      username: decoded.sub || decoded.email || 'customer',
      email: decoded.email || '',
      name: decoded.name || decoded.email?.split('@')[0] || 'Customer',
    };
  },

  // 6. Sign Out
  signOut() {
    localStorage.removeItem('infistyle_access_token');
    localStorage.removeItem('infistyle_id_token');
    localStorage.removeItem('infistyle_refresh_token');
    document.cookie = 'infistyle_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
