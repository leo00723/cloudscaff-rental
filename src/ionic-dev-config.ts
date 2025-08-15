import { IonicModule } from '@ionic/angular';

// Ionic development configuration
export const ionicDevConfig = {
  // Development mode settings
  mode: 'ios', // or 'md' for Material Design

  // Animation settings for development
  animated: true,

  // Platform settings
  platform: {
    // Add any platform-specific configurations
  },

  // Development helpers
  devTools: {
    enabled: true,
    logLevel: 'debug',
  },
};

// Helper function to configure Ionic for development
export function configureIonicForDev() {
  // Add any development-specific Ionic configurations here
  return IonicModule.forRoot({
    mode: 'ios',
    animated: true,
  });
}
