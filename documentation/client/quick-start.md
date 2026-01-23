---
id: quick-start
title: "💻 CLI Overview"
sidebar_label: "Introduction"
slug: /client
---

# Stable Coin Studio CLI

The **Stable Coin Studio Command Line Interface (CLI)** provides a streamlined workflow to create, configure, and operate stablecoins.

It uses the API exposed by the SDK and it is meant as a "demo tool" to showcase the project's functionalities.

## 🚀 Quick Start

### Pre-requirements

You must have installed

- [Node.js](https://nodejs.org/) `>= v16.13`
- [npm](https://www.npmjs.com/)

Then you must install and build the following projects :

1. [Contract installation](https://github.com/hashgraph/stablecoin-studio/blob/main/contracts/README.md#installation)
2. [SDK installation](https://github.com/hashgraph/stablecoin-studio/blob/main/sdk/README.md#installation)

### Installation

Clone the repository:
```bash
git clone [https://github.com/hashgraph/stablecoin-studio.git](https://github.com/hashgraph/stablecoin-studio.git)
cd stablecoin-studio/cli
```

Install in two ways:
1. **From NPM (Official Release):**
```bash
npm install -g @hashgraph/stablecoin-npm-cli
```
Once installed globally, you can use the `accelerator wizard` command.

2. **From Source (Local Build):**
    
    If you are working on the repository:
    1. Ensure you have built the [Contracts](../contracts) and the [SDK](../sdk).
    2. Inside the `/cli` folder:
```bash
npm install
```

## 🏁 Starting the CLI

Once you run install command, you can interact with the tool in two ways:

1. **Direct Command Line**: Show all available options and categories.
```bash
npm start
```

2. **Accelerator Wizard**: An interactive guide to help you configure your account and stablecoins step-by-step.
```bash
npm run start:wizard
```

### First Run & Configuration
The first time you execute the accelerator wizard command in your terminal, if you haven't added your default configuration path the interface will ask you whether you want to create a new configuration file in the default path. When the configuration file is created you must configure the default network, operating accounts and the factory contract id.


### Environment Warning
> ⚠️ **Important**: For testing purposes, you should create a **Testnet** account. Everything executed on Mainnet will incur real HBAR costs.

## 🔐 Authenticating an Account
The CLI supports three modes to configure your operating account:

1. **Self-Custodial (Private Key)**: Support for **ED25519** or **ECDSA** keys. Recommended for use with the Hedera Developer Portal, HashPack, or Blade.
2. **Custodial Wallets**: Native support for **Dfns** and **Fireblocks**.
3. **Multi-signature Account**: Allows creating transactions that require multiple signatures. A [backend](../backend) is required to manage the signature collection.

---

## 🗺️ Next Steps
- [Advanced Configuration & Manual Setup](./configuration)
- [Contributing to the Project](./contributing)