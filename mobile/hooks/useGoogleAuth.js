/**
 * useGoogleAuth
 * - Capacitor APK  → OAuth via deep link (reshmeai://auth)
 * - Browser/Vercel → @react-oauth/google handles it
 */

const WEB_CLIENT_ID = '821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com';
const REDIRECT_URI  = 'reshmeai://auth'; // Deep link — intercepted by the APK directly

export const isNativeAndroid = () =>
  typeof window !== 'undefined' &&
  !!window.Capacitor?.isNativePlatform?.();

function randomString(len = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

async function sha256Base64Url(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function exchangeCode(code, codeVerifier) {
  const res = await fetch('https://reshme-backend.onrender.com/api/auth/google-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: REDIRECT_URI }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Token exchange failed');
  return data; // { token, user }
}

export async function googleSignIn() {
  if (!isNativeAndroid()) throw new Error('USE_BROWSER_FLOW');

  const { Browser } = await import('@capacitor/browser');
  const { App }     = await import('@capacitor/app');

  const codeVerifier  = randomString(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const state         = randomString(16);

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
    let settled = false;
    let appUrlListener = null;

    const finish = async (fn) => {
      if (settled) return;
      settled = true;
      if (appUrlListener) appUrlListener.remove();
      await Browser.close().catch(() => {});
      fn();
    };

    // Listen for the deep link reshmeai://auth?code=...
    App.addListener('appUrlOpen', async (event) => {
      const url = event.url || '';
      if (!url.startsWith('reshmeai://auth')) return;

      try {
        // Parse as URL — replace custom scheme with https for URL parsing
        const parseable = url.replace('reshmeai://auth', 'https://reshmeai.app/auth');
        const u    = new URL(parseable);
        const code = u.searchParams.get('code');
        const st   = u.searchParams.get('state');
        const err  = u.searchParams.get('error');

        if (err) return finish(() => reject(new Error(`Google denied: ${err}`)));
        if (st !== state) return finish(() => reject(new Error('State mismatch')));
        if (!code) return finish(() => reject(new Error('No auth code received')));

        const result = await exchangeCode(code, codeVerifier);
        finish(() => resolve(result));
      } catch (e) {
        finish(() => reject(e));
      }
    }).then(listener => { appUrlListener = listener; });

    // Timeout
    setTimeout(() => {
      finish(() => reject(new Error('Google sign-in timed out')));
    }, 120000);

    Browser.open({ url: authUrl, presentationStyle: 'fullscreen' });
  });
}
