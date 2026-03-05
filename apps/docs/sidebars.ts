import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      items: [
        "gettingStarted/overview",
        "gettingStarted/quick-start",
        "gettingStarted/usage",
        "gettingStarted/standards",
      ],
    },
    {
      type: "category",
      label: "Smart Contracts",
      items: [
        "contracts/overview",
        "contracts/quick-start",
        "contracts/usage",
        "contracts/architecture",
      ],
    },
    {
      type: "category",
      label: "SDK",
      items: [
        "sdk/overview",
        "sdk/quick-start",
        "sdk/usage",
        "sdk/architecture",
      ],
    },
    {
      type: "category",
      label: "Backend",
      items: [
        "backend/overview",
        "backend/quick-start",
        "backend/usage",
        "backend/architecture",
      ],
    },
    {
      type: "category",
      label: "CLI",
      items: [
        "client/overview",
        "client/quick-start",
        "client/usage",
        "client/architecture",
      ],
    },
    {
      type: "category",
      label: "Web",
      items: [
        "web/overview",
        "web/quick-start",
        "web/usage",
        "web/architecture",
      ],
    },
  ],
};

export default sidebars;
