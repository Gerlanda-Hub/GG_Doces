import { Capacitor } from '@capacitor/core';

// Initializes native features when running inside the Android/iOS app.
// Safely does nothing when running in a normal web browser.
export async function initNativeApp() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#e8456b' });
  } catch {
    /* status bar not available */
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    /* splash screen not available */
  }

  try {
    const { App } = await import('@capacitor/app');
    // Handle Android hardware back button: exit app if on home, else go back
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch {
    /* app plugin not available */
  }
}

export const isNativeApp = () => Capacitor.isNativePlatform();
