import {navigateToApp} from './embedded.js';

// TODO: Verify routes by exploring accessibility codebase
export const nav = {
  goTo: {
    home: page => navigateToApp(page, '/'),
    menuSettings: page => navigateToApp(page, '/menu-settings'),
    widgetPreview: page => navigateToApp(page, '/widget-preview'),
    pages: page => navigateToApp(page, '/pages'),
    reports: page => navigateToApp(page, '/reports'),
    settings: page => navigateToApp(page, '/settings'),
    subscription: page => navigateToApp(page, '/subscription'),
  }
};
