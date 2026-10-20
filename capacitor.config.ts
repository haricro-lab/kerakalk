import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kerakalk.app',
  appName: 'KeraKalk',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
