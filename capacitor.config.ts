import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c2db7d2d74484eaf945ed804d3aeaccc',
  appName: 'petport',
  webDir: 'dist',
  server: {
    url: 'https://c2db7d2d-7448-4eaf-945e-d804d3aeaccc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#C8AA6E'
    }
  }
};

export default config;