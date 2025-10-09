/**
 * Production-safe logger utility
 * Automatically disables console logs in production
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, but in production send to monitoring service
    console.error(...args);
    
    // TODO: Send to error monitoring service in production
    // if (!isDevelopment) {
    //   // Example: Sentry.captureException(args[0]);
    // }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  table: (...args) => {
    if (isDevelopment) {
      console.table(...args);
    }
  },
  
  group: (label) => {
    if (isDevelopment) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
  
  time: (label) => {
    if (isDevelopment) {
      console.time(label);
    }
  },
  
  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};

// Export individual functions for convenience
export const { log, warn, error, info, debug, table, group, groupEnd, time, timeEnd } = logger;

export default logger;
