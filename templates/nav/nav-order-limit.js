import {navigateToApp} from './embedded.js';

export const nav = {
  goTo: {
    home: page => navigateToApp(page, '/'),
    orderLimits: page => navigateToApp(page, '/order-limits'),
    orderLimitType: page => navigateToApp(page, '/order-limits/type'),
    createOrderLimit: (page, type) => navigateToApp(page, `/order-limits/create/${type}`),
    editOrderLimit: (page, id) => navigateToApp(page, `/order-limits/edit/${id}`),
    branding: page => navigateToApp(page, '/branding'),
    settings: page => navigateToApp(page, '/settings'),
    checkoutRules: page => navigateToApp(page, '/settings/checkout-rules'),
    integrations: page => navigateToApp(page, '/integrations'),
    subscription: page => navigateToApp(page, '/subscription'),
  }
};
