import {navigateToApp} from './embedded.js';

// TODO: Verify routes by exploring sea-fraud-filter codebase
export const nav = {
  goTo: {
    home: page => navigateToApp(page, '/'),
    orders: page => navigateToApp(page, '/orders'),
    rules: page => navigateToApp(page, '/rules'),
    settings: page => navigateToApp(page, '/settings'),
    subscription: page => navigateToApp(page, '/subscription'),
  }
};
