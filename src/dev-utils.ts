// Development environment helpers
export const environment = {
  production: false,
  enableTracing: false,
  logLevel: 'debug',
};

// Helper functions for development
export const devUtils = {
  log: (message: any, ...args: any[]) => {
    if (!environment.production) {
      console.log(`[DEV] ${message}`, ...args);
    }
  },
  warn: (message: any, ...args: any[]) => {
    if (!environment.production) {
      console.warn(`[DEV] ${message}`, ...args);
    }
  },
  error: (message: any, ...args: any[]) => {
    if (!environment.production) {
      console.error(`[DEV] ${message}`, ...args);
    }
  },
};
