/**
 * useGoogleAuth
 * - Capacitor (Android APK) → uses native capacitor-google-auth
 * - Browser (Vercel web)    → uses @react-oauth/google credential response
 */

const isCapacitor = () =>
  typeof window !== 'undefined' &&
  window.Capacitor &&
  window.Capacitor.isNativePlatform &&
  window.Capacitor.isNativePlatform();

export async function googleSignIn() {
  if (isCapacitor()) {
    const { GoogleAuth } = await import('capacitor-google-auth');
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
