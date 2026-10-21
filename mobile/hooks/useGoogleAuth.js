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

async function pkceChallenge(v) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function nativeGoogleSignIn() {
  const { Browser } = await import('@capacitor/browser');

  const verifier  = randomStr(64);
  const challenge = await pkceChallenge(verifier);
  const sessionId = randomStr(32);

  localStorage.setItem('oauth_session_id', sessionId);
  localStorage.setItem('oauth_verifier', verifier);

  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: 'openid email profile',
    state: sessionId + '|' + verifier, // encode both in state param
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });

  return new Promise((resolve, reject) => {
    let settled = false;
    let poll = null;

    const done = async (fn) => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      try { await Browser.removeAllListeners(); } catch {}
      try { await Browser.close(); } catch {}
      fn();
    };

    // Poll backend every 1s
    let t = 0;
    poll = setInterval(async () => {
      t += 1000;
      if (t > 180000) return done(() => reject(new Error('Timed out')));
      try {
        const res  = await fetch(`${BACKEND}/google-session/${sessionId}`);
        const data = await res.json();
        if (!data.ready) return;
        if (data.success) done(() => resolve({ token: data.token, user: data.user }));
        else done(() => reject(new Error(data.message || 'Sign-in failed')));
      } catch {}
    }, 1000);

    Browser.open({ url: authUrl, presentationStyle: 'fullscreen', toolbarColor: '#0f172a' })
      .catch(e => done(() => reject(e)));
  });
}
