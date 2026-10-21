/**
 * useGoogleAuth
 * Both APK and browser use @react-oauth/google via GoogleLogin component.
 * isNativeAndroid() is kept for compatibility but both paths use browser flow.
 */

export const isNativeAndroid = () => false; // Always use browser/web flow

export async function googleSignIn() {
  throw new Error('USE_BROWSER_FLOW');
}
