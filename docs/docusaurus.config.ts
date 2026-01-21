import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Stable Coin Studio",
  tagline: "Tools for create Stable Coins on Hedera",
  favicon: "img/favicon.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/stable-coin-studio/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'stable-coin-studio', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "scs",
        path: "../docs2/",
        routeBasePath: "scs",
        sidebarPath: "./sidebars.ts",
        editUrl: "https://github.com/hashgraph/stable-coin-studio/tree/main/",
      },
    ]
    
  ],


  themes: ["@docusaurus/theme-mermaid"],

  themeConfig: {
    // Social card for link previews (optional)
    // image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Stable coin Studio",
      logo: {
        alt: "Stable coin Studio Logo",
        src: "img/logo.svg",
      },
      items: [
        
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "SCS Getting Started",
              to: "docs/intro.md",
            },
          ],
        },
        {
          title: "Products",
          items: [
            {
              label: "Asset Tokenization Studio",
              href: "https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/ats",
            },
            {
              label: "Mass Payout",
              href: "https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/mass-payout",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/hashgraph/asset-tokenization-studio",
            },
            {
              label: "Issues",
              href: "https://github.com/hashgraph/asset-tokenization-studio/issues",
            },
            {
              label: "Contributing",
              href: "https://github.com/hashgraph/asset-tokenization-studio/blob/main/CONTRIBUTING.md",
            },
          ],
        },
        {
          title: "Hedera",
          items: [
            {
              label: "Hedera Network",
              href: "https://hedera.com",
            },
            {
              label: "Hedera Docs",
              href: "https://docs.hedera.com",
            },
            {
              label: "Hedera Portal",
              href: "https://portal.hedera.com",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Hedera Hashgraph, LLC. Licensed under Apache License 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
