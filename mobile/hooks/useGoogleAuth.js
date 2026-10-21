/**
 * Google Sign-In for APK
 * Uses @capacitor/browser to open Google OAuth overlay
 * Callback page posts result to backend session store
 * App polls backend every second until result is ready
 */

export const isNativeAndroid = () =>
  typeof window !== 'undefined' &&
  !!(window.Capacitor?.isNativePlatform?.());

const CLIENT_ID = '821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com';
const REDIRECT  = 'https://sericulture-iota.vercel.app/auth/callback';
const BACKEND   = 'https://reshme-backend.onrender.com/api/auth';

function randomStr(n = 32) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, b => c[b % c.length]).join('');
}

async function pkceChallenge(verifier) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function nativeGoogleSignIn() {
  const { Browser } = await import('@capacitor/browser');

  const verifier  = randomStr(64);
  const challenge = await pkceChallenge(verifier);
  const sessionId = randomStr(32);

  // Store for callback page to read
  localStorage.setItem('oauth_session_id', sessionId);
  localStorage.setItem('oauth_verifier', verifier);

  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id:             CLIENT_ID,
    redirect_uri:          REDIRECT,
    response_type:         'code',
    scope:                 'openid email profile',
    state:                 sessionId, // use sessionId as state
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    prompt:                'select_account',
  });

  return new Promise((resolve, reject) => {
    let done = false;
    let pollInterval = null;

    const finish = async (fn) => {
      if (done) return;
      done = true;
      clearInterval(pollInterval);
      await Browser.removeAllListeners().catch(() => {});
      await Browser.close().catch(() => {});
      fn();
    };

    // Browser closed by user = cancelled
    Browser.addListener('browserFinished', () => {
      finish(() => reject(new Error('Google sign-in was cancelled')));
    });

    // Poll backend every 1.5 seconds for up to 2 minutes
    let elapsed = 0;
    pollInterval = setInterval(async () => {
      elapsed += 1500;
      if (elapsed > 120000) {
        return finish(() => reject(new Error('Google sign-in timed out')));
      }
      try {
        const res  = await fetch(`${BACKEND}/google-session/${sessionId}`);
        const data = await res.json();
        if (!data.ready) return; // not done yet
        if (!data.success) return finish(() => reject(new Error(data.message || 'Sign-in failed')));
        finish(() => resolve({ token: data.token, user: data.user }));
      } catch {} // network error, keep polling
    }, 1500);

    Browser.open({ url: authUrl, presentationStyle: 'fullscreen', toolbarColor: '#0f172a' });
  });
}
