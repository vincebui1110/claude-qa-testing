import {navigateToApp} from './embedded.js';

// TODO: Verify routes by exploring cookie-bar codebase
export const nav = {
  goTo: {
    home: page => navigateToApp(page, '/'),
    settings: page => navigateToApp(page, '/settings'),
    customization: page => navigateToApp(page, '/customization'),
    bannerPreview: page => navigateToApp(page, '/banner-preview'),
    cookiesManagement: page => navigateToApp(page, '/cookies-management'),
    subscription: page => navigateToApp(page, '/subscription'),
    integrations: page => navigateToApp(page, '/integrations'),
  }
};
