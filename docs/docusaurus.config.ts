import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Stable Coin Studio",
  tagline: "Issue and manage institutional stablecoins on Hedera",
  favicon: "img/coin.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://hashgraph.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/stablecoin-studio/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'hashgraph', // Usually your GitHub org/user name.
  projectName: 'stablecoin-studio', // Usually your repo name.

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
      "classic",
      {
        docs: false, // Disable default docs plugin
        blog: false, // Blog disabled
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "default",
        path: "../documentation",
        routeBasePath: "scs",
        sidebarPath: "./sidebars.ts",
        editUrl: "https://github.com/hashgraph/stablecoin-studio/tree/main/",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "references",
        path: "../documentation-references",
        routeBasePath: "references",
        sidebarPath: "./sidebarsReferences.ts",
        editUrl: "https://github.com/hashgraph/stablecoin-studio/tree/main/",
      },
    ],
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en"],
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: "/scs", // El buscador encontrará los docs por esta ruta
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
      },
    ],    
  ],

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    // Social card for link previews (optional)
    // image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Stable Coin Studio",
      logo: {
        alt: "Stable Coin Studio Logo",
        src: "img/coin.svg",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          //docsPluginId: "scs",
          position: "left",
          label: "SCS",
        },
        {
          type: "doc",
          docId: "intro",
          docsPluginId: "references",
          position: "left",
          label: "References",
        },
        {
          href: "https://github.com/hashgraph/stablecoin-studio",
          label: "GitHub",
          position: "right",
        }
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
              to: "/scs/gettingStarted/overview",
            },
          ],
        },
        {
          title: "Products",
          items: [
            {
              label: "Stable Coin Studio",
              href: "https://github.com/hashgraph/stablecoin-studio/tree/main",
            }
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/hashgraph/stablecoin-studio",
            },
            {
              label: "Issues",
              href: "https://github.com/hashgraph/stablecoin-studio/issues",
            },
            {
              label: "Contributing",
              href: "https://github.com/hashgraph/stablecoin-studio/blob/main/CONTRIBUTING.md",
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
