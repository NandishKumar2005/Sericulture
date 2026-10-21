/**
 * useGoogleAuth
 * - Capacitor APK  → OAuth via @capacitor/browser + localStorage polling
 * - Browser/Vercel → @react-oauth/google handles it
 */

const WEB_CLIENT_ID = '821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com';
const REDIRECT_URI  = 'https://sericulture-iota.vercel.app/auth/callback';

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

async function processCallbackUrl(url, codeVerifier, state) {
  const u   = new URL(url);
  const code = u.searchParams.get('code');
  const st   = u.searchParams.get('state');
  const err  = u.searchParams.get('error');

  if (err) throw new Error(`Google denied sign-in: ${err}`);
  if (st !== state) throw new Error('State mismatch — please try again');
  if (!code) throw new Error('No auth code received from Google');

  return exchangeCode(code, codeVerifier);
}

export async function googleSignIn() {
  if (!isNativeAndroid()) throw new Error('USE_BROWSER_FLOW');

  const { Browser } = await import('@capacitor/browser');

  const codeVerifier  = randomString(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const state         = randomString(16);

  // Clear any stale callback
  localStorage.removeItem('oauth_callback_url');
  localStorage.removeItem('oauth_callback_time');

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
    let pollInterval = null;

    const finish = async (fn) => {
      if (settled) return;
      settled = true;
      clearInterval(pollInterval);
      await Browser.close().catch(() => {});
      fn();
    };

    // Poll localStorage for the callback URL (set by the callback page)
    const startTime = Date.now();
    pollInterval = setInterval(async () => {
      const callbackUrl  = localStorage.getItem('oauth_callback_url');
      const callbackTime = parseInt(localStorage.getItem('oauth_callback_time') || '0');

      // Only process if callback happened after we opened the browser
      if (callbackUrl && callbackTime > startTime && callbackUrl.includes('/auth/callback')) {
        localStorage.removeItem('oauth_callback_url');
        localStorage.removeItem('oauth_callback_time');

        try {
          const result = await processCallbackUrl(callbackUrl, codeVerifier, state);
          finish(() => resolve(result));
        } catch (e) {
          finish(() => reject(e));
        }
      }
    }, 500);

    // Also listen for postMessage
    const msgHandler = async (event) => {
      const url = event.data?.url || '';
      if (!url.includes('/auth/callback')) return;
      window.removeEventListener('message', msgHandler);
      try {
        const result = await processCallbackUrl(url, codeVerifier, state);
        finish(() => resolve(result));
      } catch (e) {
        finish(() => reject(e));
      }
    };
    window.addEventListener('message', msgHandler);

    // Timeout after 2 min
    setTimeout(() => {
      window.removeEventListener('message', msgHandler);
      finish(() => reject(new Error('Google sign-in timed out')));
    }, 120000);

    Browser.open({ url: authUrl, presentationStyle: 'fullscreen' });
  });
}
