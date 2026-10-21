/**
 * useGoogleAuth - detects if running in Capacitor native Android
 */
export const isNativeAndroid = () =>
  typeof window !== 'undefined' &&
  !!(window.Capacitor?.isNativePlatform?.());

export async function googleSignIn() {
  throw new Error('USE_BROWSER_FLOW');
}
