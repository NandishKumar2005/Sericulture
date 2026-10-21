/**
 * Google Sign-In for APK using @capacitor/browser
 * Opens Google OAuth in an in-app browser overlay (stays inside the app)
 * Detects the callback URL and extracts the auth code
 */

export const isNativeAndroid = () =>
  typeof window !== 'undefined' &&
  !!(window.Capacitor?.isNativePlatform?.());

const CLIENT_ID   = '821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com';
const REDIRECT    = 'https://sericulture-iota.vercel.app/auth/callback';
const BACKEND     = 'https://reshme-backend.onrender.com/api/auth/google-callback';

function randomStr(n = 64) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, b => c[b % c.length]).join('');
}

async function pkceChallenge(verifier) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function nativeGoogleSignIn() {
  const { Browser } = await import('@capacitor/browser');

  const verifier   = randomStr(64);
  const challenge  = await pkceChallenge(verifier);
  const state      = randomStr(16);

  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id:             CLIENT_ID,
    redirect_uri:          REDIRECT,
    response_type:         'code',
    scope:                 'openid email profile',
    state,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    prompt:                'select_account',
  });

  return new Promise((resolve, reject) => {
    let done = false;

    const finish = async (fn) => {
      if (done) return;
      done = true;
      await Browser.removeAllListeners();
      await Browser.close().catch(() => {});
      fn();
    };

    // Capacitor Browser fires this when any page loads in the in-app browser
    Browser.addListener('browserPageLoaded', async () => {
      try {
        // We can't directly read the URL from the event in Capacitor Browser
        // But we CAN detect when the browser closed (user cancelled) vs completed
      } catch {}
    });

    // This fires when user closes browser manually
    Browser.addListener('browserFinished', () => {
      if (!done) finish(() => reject(new Error('Google sign-in was cancelled')));
    });

    // The key: inject a message listener BEFORE opening, so when
    // the callback page posts a message, we catch it
    const msgHandler = async (event) => {
      const d = event?.data;
      if (!d?.type === 'google_oauth' && !d?.code) return;
      if (d?.type !== 'google_oauth') return;

      window.removeEventListener('message', msgHandler);

      if (d.error) return finish(() => reject(new Error('Google denied: ' + d.error)));
      if (d.state !== state) return finish(() => reject(new Error('State mismatch')));
      if (!d.code) return finish(() => reject(new Error('No auth code')));

      try {
        const res = await fetch(BACKEND, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: d.code, code_verifier: verifier, redirect_uri: REDIRECT }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Token exchange failed');
        finish(() => resolve(data));
      } catch (e) {
        finish(() => reject(e));
      }
    };

    window.addEventListener('message', msgHandler);

    // Timeout
    setTimeout(() => {
      window.removeEventListener('message', msgHandler);
      finish(() => reject(new Error('Google sign-in timed out')));
    }, 120000);

    Browser.open({ url, presentationStyle: 'fullscreen', toolbarColor: '#0f172a' });
  });
}
