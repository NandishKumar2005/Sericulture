/**
 * useGoogleAuth
 * - Capacitor (Android APK) → uses native @codetrix-studio/capacitor-google-auth
 * - Browser (Vercel web)    → uses @react-oauth/google credential response
 */

const isCapacitor = () =>
  typeof window !== 'undefined' &&
  window.Capacitor &&
  window.Capacitor.isNativePlatform &&
  window.Capacitor.isNativePlatform();

export async function googleSignIn() {
  if (isCapacitor()) {
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
    await GoogleAuth.initialize({
      clientId: '821368596969-o76smk2hdvadmj2uq5af6las5m6dpb70.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
    const user = await GoogleAuth.signIn();
    const idToken = user?.authentication?.idToken;
    if (!idToken) throw new Error('Google sign-in failed: no ID token returned');
    return idToken;
  } else {
    throw new Error('USE_BROWSER_FLOW');
  }
}

export function isNativeAndroid() {
  return isCapacitor();
}
