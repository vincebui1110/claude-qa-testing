import {navigateToApp} from './embedded.js';

// TODO: Verify routes by exploring age-verification codebase
export const nav = {
  goTo: {
    home: page => navigateToApp(page, '/'),
    campaigns: page => navigateToApp(page, '/campaigns'),
    createCampaign: (page, type) => navigateToApp(page, `/campaigns/create/${type}`),
    editCampaign: (page, id) => navigateToApp(page, `/campaigns/edit/${id}`),
    customization: page => navigateToApp(page, '/customization'),
    settings: page => navigateToApp(page, '/settings'),
    subscription: page => navigateToApp(page, '/subscription'),
  }
};
