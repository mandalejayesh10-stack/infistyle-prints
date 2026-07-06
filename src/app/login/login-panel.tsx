'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sparkles, Mail, Lock, User, KeySquare } from 'lucide-react';
import { cognitoClient } from '@/lib/aws/client';

type TabType = 'google' | 'email';
type ModeType = 'login' | 'signup';

export default function LoginPanel() {
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/';
  const errorMsg = searchParams?.get('error');

  const [activeTab, setActiveTab] = useState<TabType>('google');
  const [authMode, setAuthMode] = useState<ModeType>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBypassLogin = () => {
    const payload = {
      sub: 'dev-admin-id',
      email: 'admin@infistyle.com',
      name: 'Jayesh Mandale',
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
      isAdmin: true
    };
    
    // Browser-safe base64 encoding
    const payloadBase64 = btoa(JSON.stringify(payload));
    const mockJwt = `header.${payloadBase64}.signature`;
    
    // Set cookies & local storage
    document.cookie = `infistyle_session=${mockJwt}; path=/; max-age=2592000`;
    localStorage.setItem('infistyle_access_token', mockJwt);
    
    window.location.href = next;
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setMessage(null);
    
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'infistyle';
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    // Redirect browser to Cognito Hosted OAuth2 authorize endpoint for Google Sign-in
    window.location.href = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/authorize?identity_provider=Google&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&client_id=${clientId}&scope=email+openid+profile&state=${encodeURIComponent(next)}`;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (authMode === 'login') {
        await cognitoClient.signIn(email, password);
        if (email.toLowerCase() === 'admin@infistyle.com') {
          window.location.href = '/admin';
        } else {
          window.location.href = next;
        }
      } else {
        await cognitoClient.signUp(email, password, name || 'Customer');
        setShowVerification(true);
        setMessage({
          type: 'success',
          text: 'Registration initiated! A verification code has been sent to your email address.',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setMessage({ type: 'error', text: 'Please enter the verification code.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await cognitoClient.confirmSignUp(email, verificationCode);
      setMessage({
        type: 'success',
        text: 'Email verified successfully! You can now log in using your password.',
      });
      setShowVerification(false);
      setAuthMode('login');
      setPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-dark-charcoal">
          infi<span className="text-primary">style</span>
        </h1>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Premium Custom Printing Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 brand-card sm:px-10">
          
          {/* Tab Selector */}
          {!showVerification && (
            <div className="flex border-b-2 border-primary mb-6">
              <button
                onClick={() => { setActiveTab('google'); setMessage(null); }}
                className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider transition-all border-t-2 border-x-2 ${
                  activeTab === 'google'
                    ? 'border-primary bg-primary/5 text-dark-charcoal font-black border-b-transparent translate-y-[2px]'
                    : 'border-transparent text-gray-400 hover:text-dark-charcoal'
                }`}
              >
                Google Auth
              </button>
              <button
                onClick={() => { setActiveTab('email'); setMessage(null); }}
                className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider transition-all border-t-2 border-x-2 ${
                  activeTab === 'email'
                    ? 'border-primary bg-primary/5 text-dark-charcoal font-black border-b-transparent translate-y-[2px]'
                    : 'border-transparent text-gray-400 hover:text-dark-charcoal'
                }`}
              >
                Email & Credentials
              </button>
            </div>
          )}

          {errorMsg && !message && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {message && (
            <div className={`mb-4 p-3 border text-sm font-medium ${
              message.type === 'success' 
                ? 'bg-yellow-50 border-primary text-dark-charcoal' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          {/* Verification Code View */}
          {showVerification ? (
            <form onSubmit={handleConfirmSignUp} className="space-y-4">
              <h3 className="text-lg font-bold text-dark-charcoal">Verify Your Email</h3>
              <p className="text-xs text-gray-500">
                Please enter the 6-digit confirmation code sent to **{email}**.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Verification Code</label>
                <div className="relative">
                  <KeySquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2 border-2 border-primary focus:outline-none text-sm bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-dark-charcoal border-2 border-primary font-black uppercase text-xs tracking-widest hover:bg-white hover:text-dark-charcoal transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Confirm Verification Code'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setMessage(null);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-primary underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* TAB 1: Google Login */}
              {activeTab === 'google' && (
                <div className="space-y-6 py-4 text-center">
                  <h3 className="text-lg font-bold text-dark-charcoal">Quick Google Account Access</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Sign in via AWS Cognito federated Google provider. Real-time token synchronization is configured.
                  </p>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-primary bg-white text-dark-charcoal font-semibold hover:bg-primary transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-charcoal"></div>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}

              {/* TAB 2: Email & Password */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full pl-10 pr-4 py-2 border-2 border-primary focus:outline-none text-sm bg-white"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2 border-2 border-primary focus:outline-none text-sm bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2 border-2 border-primary focus:outline-none text-sm bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-primary text-dark-charcoal border-2 border-primary font-black uppercase text-xs tracking-widest hover:bg-white hover:text-dark-charcoal transition-all disabled:opacity-50"
                  >
                    {loading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === 'login' ? 'signup' : 'login');
                        setMessage(null);
                      }}
                      className="text-xs font-bold text-gray-500 hover:text-primary underline"
                    >
                      {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
            <span>Secure Cognito Login</span>
            <span>•</span>
            <span>Multi-User System</span>
          </div>

        </div>
      </div>
    </div>
  );
}
