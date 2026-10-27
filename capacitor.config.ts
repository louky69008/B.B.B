import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bbbcie.app',
  appName: 'B.B.B & cie',
  webDir: 'dist',
  server: {
    // En dev : décommente l'URL ci-dessous pour pointer vers le preview Lovable
    // url: 'https://id-preview--43e583f9-0012-4d9b-8bac-3cdddf600e04.lovable.app',
    // cleartext: true,
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
