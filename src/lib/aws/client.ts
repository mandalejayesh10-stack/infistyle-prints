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

  // 5. Sign Out
  signOut() {
    localStorage.removeItem('infistyle_access_token');
    localStorage.removeItem('infistyle_id_token');
    localStorage.removeItem('infistyle_refresh_token');
    document.cookie = 'infistyle_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
