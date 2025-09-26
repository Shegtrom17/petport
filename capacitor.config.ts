import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c2db7d2d74484eaf945ed804d3aeaccc',
  appName: 'petport',
  webDir: 'dist',
  // Remove server config for production builds to use bundled files on iOS
  ...(process.env.NODE_ENV !== 'production' && {
    server: {
      url: 'https://petport.app',
      cleartext: true
    }
  }),
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#C8AA6E'
    }
  }
};

export default config;