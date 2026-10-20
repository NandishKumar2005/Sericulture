/**
 * useGoogleAuth
 * Detects runtime environment:
 * - Capacitor (Android APK) → uses native @codetrix-studio/capacitor-google-auth
 * - Browser (Vercel web)    → uses @react-oauth/google credential response
 *
 * Returns { signIn } where signIn() returns a Google ID token string.
 */

const isCapacitor = () =>
  typeof window !== 'undefined' &&
  window.Capacitor &&
  window.Capacitor.isNativePlatform &&
  window.Capacitor.isNativePlatform();

export async function googleSignIn() {
  if (isCapacitor()) {
    // Native Android path — uses Google Sign-In SDK via Capacitor plugin
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
    await GoogleAuth.initialize({
      clientId: '821368596969-ecg9q9cj692prkp1uutckppssf6l1ccs.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
    const user = await GoogleAuth.signIn();
    // The plugin returns authentication.idToken
    const idToken = user?.authentication?.idToken;
    if (!idToken) throw new Error('Google sign-in failed: no ID token returned');
    return idToken;
  } else {
    // Browser path — caller must handle GoogleLogin component callback
    throw new Error('USE_BROWSER_FLOW');
  }
}

export function isNativeAndroid() {
  return isCapacitor();
}
