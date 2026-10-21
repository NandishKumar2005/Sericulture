/**
 * useGoogleAuth
 * - Capacitor APK  → OAuth via @capacitor/browser (in-app browser, PKCE flow)
 * - Browser/Vercel → @react-oauth/google handles it via GoogleLogin component
 */

const WEB_CLIENT_ID = '821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com';
const REDIRECT_URI  = 'https://sericulture-iota.vercel.app/auth/callback';

export const isNativeAndroid = () =>
  typeof window !== 'undefined' &&
  !!window.Capacitor?.isNativePlatform?.();

// Generate random string for state/code_verifier
function randomString(len = 48) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  arr.forEach(b => result += chars[b % chars.length]);
  return result;
}

async function sha256Base64Url(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function googleSignIn() {
  if (!isNativeAndroid()) {
    throw new Error('USE_BROWSER_FLOW');
  }

  const { Browser } = await import('@capacitor/browser');

  const codeVerifier  = randomString(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const state         = randomString(16);

  // Store for later retrieval
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('pkce_state', state);

  const params = new URLSearchParams({
    client_id:             WEB_CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    response_type:         'code',
    scope:                 'openid email profile',
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
    access_type:           'offline',
    prompt:                'select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return new Promise((resolve, reject) => {
    // Listen for redirect back from Google
    const handler = async (event) => {
      const url = event?.url || event?.detail?.url || '';
      if (!url.includes('/auth/callback')) return;

      window.removeEventListener('capacitorBrowserPageLoaded', handler);
      await Browser.close().catch(() => {});

      try {
        const urlObj = new URL(url);
        const code          = urlObj.searchParams.get('code');
        const returnedState = urlObj.searchParams.get('state');
        const error         = urlObj.searchParams.get('error');

        if (error) return reject(new Error(`Google sign-in denied: ${error}`));
        if (returnedState !== sessionStorage.getItem('pkce_state')) {
          return reject(new Error('State mismatch — possible CSRF'));
        }
        if (!code) return reject(new Error('No auth code received'));

        // Exchange code for tokens via backend
        const res = await fetch('https://reshme-backend.onrender.com/api/auth/google-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            code_verifier: sessionStorage.getItem('pkce_code_verifier'),
            redirect_uri:  REDIRECT_URI,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Token exchange failed');
        resolve(data); // { token, user }
      } catch (err) {
        reject(err);
      }
    };

    window.addEventListener('capacitorBrowserPageLoaded', handler);
    Browser.open({ url: authUrl, presentationStyle: 'popover' });

    // Timeout fallback
    setTimeout(() => {
      window.removeEventListener('capacitorBrowserPageLoaded', handler);
      reject(new Error('Google sign-in timed out'));
    }, 120000);
  });
}
