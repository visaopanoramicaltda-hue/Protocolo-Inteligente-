
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'br.com.simbiose.protocolo',
  appName: 'Simbiose',
  webDir: 'dist',
  android: {
    backgroundColor: '#050505',
    allowMixedContent: false,
    captureInput: false,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    backgroundColor: '#050505',
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
