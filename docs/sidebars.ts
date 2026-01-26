import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: [
        'gettingStarted/getting-started',
        'gettingStarted/architecture',
        'gettingStarted/management',
        'gettingStarted/dev-reference',
        'gettingStarted/standards',
        'gettingStarted/troubleshooting',
        'gettingStarted/security',
      ],
    },
    {
      type: 'category',
      label: '🛠️ SDK',
      items: [
        'sdk/README',
      ],
    },
    {
      type: 'category',
      label: '⚙️ Backend',
      items: [
        'backend/index',
        'backend/architecture',
        'backend/installation',
        'backend/api-reference',
        'backend/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '👤 Client',
      items: [
        'client/quick-start',
        'client/configuration',
        'client/commands',
        'client/usage',
        'client/factories-resolvers',
        'client/architecture',
        'client/troubleshooting',
        'client/community'
      ],
    },
    {
      type: 'category',
      label: '🌐 Web',
      items: [
        'web/README',
      ],
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
