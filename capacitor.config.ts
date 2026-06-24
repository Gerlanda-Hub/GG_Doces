import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ggdoces.app',
  appName: 'Mundo de Doces da GG',
  webDir: 'dist',
  // Como o site usa HashRouter (#/), funciona perfeitamente com o esquema de ficheiros nativo.
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#e8456b',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#e8456b',
      overlaysWebView: false,
    },
  },
};

export default config;
